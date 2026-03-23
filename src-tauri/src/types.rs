use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LibraryIndex {
    pub scanned_at: String,
    pub library_path: String,
    pub categories: Vec<CategorySummary>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CategorySummary {
    pub kind: String,
    pub label: String,
    pub items: Vec<LibraryItem>,
    pub is_empty: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LibraryItem {
    pub slug: String,
    pub name: String,
    pub description: String,
    pub category_kind: String,
    pub family_prefix: Option<String>,
    pub status: String,
    pub accent_color: Option<String>,
    pub last_modified: String,
    pub manifest: Option<ManifestData>,
    pub readme_excerpt: Option<String>,
    pub file_count: u32,
    pub has_preview: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ManifestData {
    pub name: String,
    #[serde(default)]
    pub version: String,
    #[serde(default)]
    pub description: String,
    pub created: Option<String>,
    pub heritage: Option<Heritage>,
    pub palette: Option<Palette>,
    pub typography: Option<TypographyMeta>,
    pub structure: Option<Structure>,
    #[serde(default)]
    pub targets: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Heritage {
    #[serde(default)]
    pub parents: Vec<String>,
    #[serde(default)]
    pub fonts: Vec<String>,
    #[serde(default)]
    pub font_source: String,
    #[serde(default)]
    pub license: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Palette {
    #[serde(default)]
    pub mode: String,
    #[serde(default)]
    pub accent: String,
    #[serde(default)]
    pub dark_background: String,
    #[serde(default)]
    pub light_background: String,
    #[serde(default)]
    pub gray_undertone: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TypographyMeta {
    #[serde(default)]
    pub sans: String,
    #[serde(default)]
    pub mono: String,
    pub pixel: Option<String>,
    #[serde(default)]
    pub scale_ratio: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Structure {
    pub preview: Option<String>,
    #[serde(default)]
    pub components: Vec<String>,
    #[serde(default)]
    pub tokens: HashMap<String, String>,
    #[serde(default)]
    pub docs: Vec<String>,
}
