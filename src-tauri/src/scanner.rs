use std::fs;
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

use walkdir::WalkDir;

use crate::types::{CategorySummary, LibraryIndex, LibraryItem, ManifestData};

/// Category definitions: (directory_name, display_label)
const CATEGORIES: &[(&str, &str)] = &[
    ("systems", "Systems"),
    ("typography", "Typography"),
    ("iconography", "Iconography"),
    ("motion", "Motion"),
    ("palettes", "Palettes"),
    ("patterns", "Patterns"),
];

/// Directories to skip when walking file trees.
const SKIP_DIRS: &[&str] = &[".git", "node_modules", ".next", "target", ".DS_Store"];

/// Convert a SystemTime to an ISO 8601 / RFC 3339 formatted string (UTC).
fn system_time_to_iso(time: SystemTime) -> String {
    let secs = time
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    // Break unix timestamp into date/time components
    let days = secs / 86400;
    let time_of_day = secs % 86400;
    let hours = time_of_day / 3600;
    let minutes = (time_of_day % 3600) / 60;
    let seconds = time_of_day % 60;

    // Civil date from days since epoch (1970-01-01)
    // Algorithm from Howard Hinnant's date library
    let z = days as i64 + 719468;
    let era = if z >= 0 { z } else { z - 146096 } / 146097;
    let doe = (z - era * 146097) as u64;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe as i64 + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };

    format!(
        "{:04}-{:02}-{:02}T{:02}:{:02}:{:02}Z",
        y, m, d, hours, minutes, seconds
    )
}

/// Scan a Design Library directory and produce a full index.
pub fn scan(library_path: &Path) -> Result<LibraryIndex, Box<dyn std::error::Error>> {
    let mut categories = Vec::new();

    for &(kind, label) in CATEGORIES {
        let cat_dir = library_path.join(kind);
        let mut items = Vec::new();

        if cat_dir.is_dir() {
            let entries = fs::read_dir(&cat_dir)?;
            for entry in entries.flatten() {
                let path = entry.path();
                // Only process subdirectories, skip files at category root
                if !path.is_dir() {
                    continue;
                }
                if let Some(item) = scan_item(&path, kind) {
                    items.push(item);
                }
            }
        }

        // Sort items by last_modified descending
        items.sort_by(|a, b| b.last_modified.cmp(&a.last_modified));

        let is_empty = items.is_empty();
        categories.push(CategorySummary {
            kind: kind.to_string(),
            label: label.to_string(),
            items,
            is_empty,
        });
    }

    Ok(LibraryIndex {
        scanned_at: system_time_to_iso(SystemTime::now()),
        library_path: library_path.to_string_lossy().to_string(),
        categories,
    })
}

/// Scan a single item directory within a category.
fn scan_item(item_path: &Path, category_kind: &str) -> Option<LibraryItem> {
    let slug = item_path.file_name()?.to_string_lossy().to_string();

    // Parse manifest.json if present
    let manifest = read_manifest(item_path);

    // Read README.md or SPEC.md for name and description
    let (readme_name, readme_desc, readme_excerpt) = read_readme(item_path);

    // Name: prefer manifest name, fall back to readme heading, fall back to slug
    let name = manifest
        .as_ref()
        .map(|m| m.name.clone())
        .filter(|n| !n.is_empty())
        .or_else(|| readme_name.clone())
        .unwrap_or_else(|| slug.clone());

    // Description: prefer manifest description, fall back to readme paragraph
    let description = manifest
        .as_ref()
        .map(|m| m.description.clone())
        .filter(|d| !d.is_empty())
        .or_else(|| readme_desc.clone())
        .unwrap_or_default();

    // Count files (excluding skip dirs)
    let file_count = count_files(item_path);

    // Last modified: max mtime across all files
    let last_modified = get_last_modified(item_path);

    // Has preview: check for preview/index.html or any .html file
    let has_preview = check_has_preview(item_path);

    // Status: determine from manifest content
    let status = determine_status(&manifest, item_path);

    // Family prefix: first segment before '-' in slug
    let family_prefix = derive_family_prefix(&slug);

    // Accent color from manifest palette
    let accent_color = manifest
        .as_ref()
        .and_then(|m| m.palette.as_ref())
        .map(|p| p.accent.clone())
        .filter(|a| !a.is_empty());

    Some(LibraryItem {
        slug,
        name,
        description,
        category_kind: category_kind.to_string(),
        family_prefix: Some(family_prefix),
        status,
        accent_color,
        last_modified,
        manifest,
        readme_excerpt,
        file_count,
        has_preview,
    })
}

/// Try to read and parse manifest.json from an item directory.
fn read_manifest(item_path: &Path) -> Option<ManifestData> {
    let manifest_path = item_path.join("manifest.json");
    let content = fs::read_to_string(&manifest_path).ok()?;
    serde_json::from_str(&content).ok()
}

/// Read README.md or SPEC.md, extracting the first heading and first paragraph.
/// Returns (heading, first_paragraph, excerpt).
fn read_readme(item_path: &Path) -> (Option<String>, Option<String>, Option<String>) {
    let readme_path = item_path.join("README.md");
    let spec_path = item_path.join("SPEC.md");

    let content = fs::read_to_string(&readme_path)
        .or_else(|_| fs::read_to_string(&spec_path))
        .ok();

    let content = match content {
        Some(c) => c,
        None => return (None, None, None),
    };

    let mut heading: Option<String> = None;
    let mut first_paragraph = String::new();
    let mut in_paragraph = false;

    for line in content.lines() {
        let trimmed = line.trim();

        // Extract first # heading
        if heading.is_none() && trimmed.starts_with("# ") {
            heading = Some(trimmed.trim_start_matches("# ").to_string());
            continue;
        }

        // After heading, collect first non-empty paragraph
        if heading.is_some() && !in_paragraph && !trimmed.is_empty() {
            // Skip blockquotes and other headings for the paragraph
            if trimmed.starts_with('#') {
                break;
            }
            in_paragraph = true;
            // Strip leading '>' for blockquote lines
            let clean = trimmed.trim_start_matches('>').trim();
            first_paragraph.push_str(clean);
        } else if in_paragraph {
            if trimmed.is_empty() {
                break;
            }
            let clean = trimmed.trim_start_matches('>').trim();
            first_paragraph.push(' ');
            first_paragraph.push_str(clean);
        }
    }

    let excerpt = if first_paragraph.is_empty() {
        None
    } else {
        // Truncate to ~200 chars
        let truncated = if first_paragraph.len() > 200 {
            let mut end = 200;
            // Try to break at a word boundary
            if let Some(pos) = first_paragraph[..200].rfind(' ') {
                end = pos;
            }
            format!("{}...", &first_paragraph[..end])
        } else {
            first_paragraph.clone()
        };
        Some(truncated)
    };

    let desc = if first_paragraph.is_empty() {
        None
    } else {
        Some(first_paragraph)
    };

    (heading, desc, excerpt)
}

/// Count files in the item directory, excluding skip dirs.
fn count_files(item_path: &Path) -> u32 {
    let mut count = 0u32;
    for entry in WalkDir::new(item_path)
        .into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            !SKIP_DIRS.contains(&name.as_ref())
        })
        .flatten()
    {
        if entry.file_type().is_file() {
            count += 1;
        }
    }
    count
}

/// Get the most recent modification time across all files.
fn get_last_modified(item_path: &Path) -> String {
    let mut max_time: Option<SystemTime> = None;

    for entry in WalkDir::new(item_path)
        .into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            !SKIP_DIRS.contains(&name.as_ref())
        })
        .flatten()
    {
        if entry.file_type().is_file() {
            if let Ok(meta) = entry.metadata() {
                if let Ok(mtime) = meta.modified() {
                    max_time = Some(match max_time {
                        Some(current) => current.max(mtime),
                        None => mtime,
                    });
                }
            }
        }
    }

    match max_time {
        Some(time) => system_time_to_iso(time),
        None => String::new(),
    }
}

/// Check if the item has a preview: preview/index.html or any .html file.
fn check_has_preview(item_path: &Path) -> bool {
    // Check preview/index.html first
    if item_path.join("preview").join("index.html").exists() {
        return true;
    }

    // Check for any .html file
    for entry in WalkDir::new(item_path)
        .into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            !SKIP_DIRS.contains(&name.as_ref())
        })
        .flatten()
    {
        if entry.file_type().is_file() {
            if let Some(ext) = entry.path().extension() {
                if ext == "html" {
                    return true;
                }
            }
        }
    }

    false
}

/// Determine item status based on manifest content and file structure.
fn determine_status(manifest: &Option<ManifestData>, item_path: &Path) -> String {
    if let Some(m) = manifest {
        // Has manifest with populated tokens -> "complete"
        if let Some(ref structure) = m.structure {
            if !structure.tokens.is_empty() {
                return "complete".to_string();
            }
        }
    }

    // Check if there are any doc files (README, SPEC, docs/)
    let has_docs = item_path.join("README.md").exists()
        || item_path.join("SPEC.md").exists()
        || item_path.join("docs").is_dir();

    if has_docs {
        return "spec-only".to_string();
    }

    "empty".to_string()
}

/// Derive family prefix: first segment before '-' in slug, or slug itself.
fn derive_family_prefix(slug: &str) -> String {
    match slug.find('-') {
        Some(pos) => slug[..pos].to_string(),
        None => slug.to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn library_path() -> PathBuf {
        let home = dirs::home_dir().expect("no home directory");
        home.join("LocalDev/Design_Library")
    }

    #[test]
    fn test_scan_produces_six_categories() {
        let path = library_path();
        let index = scan(&path).expect("scan should succeed");
        assert_eq!(index.categories.len(), 6);

        let kinds: Vec<&str> = index.categories.iter().map(|c| c.kind.as_str()).collect();
        assert_eq!(
            kinds,
            vec!["systems", "typography", "iconography", "motion", "palettes", "patterns"]
        );
    }

    #[test]
    fn test_systems_has_three_items() {
        let path = library_path();
        let index = scan(&path).expect("scan should succeed");
        let systems = &index.categories[0];
        assert_eq!(systems.kind, "systems");
        assert_eq!(systems.items.len(), 3);
        assert!(!systems.is_empty);
    }

    #[test]
    fn test_forge_accent_and_status() {
        let path = library_path();
        let index = scan(&path).expect("scan should succeed");
        let systems = &index.categories[0];
        let forge = systems
            .items
            .iter()
            .find(|i| i.slug == "forge")
            .expect("forge should exist");

        assert_eq!(forge.accent_color.as_deref(), Some("#D15010"));
        assert_eq!(forge.status, "complete");
        assert_eq!(forge.name, "Forge");
        assert!(forge.has_preview);
        assert!(forge.manifest.is_some());
    }

    #[test]
    fn test_typography_is_empty() {
        let path = library_path();
        let index = scan(&path).expect("scan should succeed");
        let typography = index
            .categories
            .iter()
            .find(|c| c.kind == "typography")
            .expect("typography category should exist");
        assert!(typography.is_empty);
        assert!(typography.items.is_empty());
    }

    #[test]
    fn test_iconography_has_one_item() {
        let path = library_path();
        let index = scan(&path).expect("scan should succeed");
        let iconography = index
            .categories
            .iter()
            .find(|c| c.kind == "iconography")
            .expect("iconography category should exist");
        assert_eq!(iconography.items.len(), 1);
        assert!(!iconography.is_empty);
    }
}
