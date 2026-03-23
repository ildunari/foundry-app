import { Settings, FolderOpen, Palette, Info } from "lucide-react";

function SettingRow({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-shell-border last:border-0">
      <div>
        <p className="text-sm text-shell-text-primary">{label}</p>
        {description && (
          <p className="text-xs text-shell-text-tertiary mt-0.5">{description}</p>
        )}
      </div>
      <span className="text-sm text-shell-text-secondary bg-shell-raised border border-shell-border rounded px-2.5 py-1">
        {value}
      </span>
    </div>
  );
}

function SettingSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Settings;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-shell-text-tertiary" />
        <h2 className="text-xs uppercase tracking-wider text-shell-text-tertiary font-medium">
          {title}
        </h2>
      </div>
      <div className="bg-shell-raised border border-shell-border rounded-lg px-4">
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-1">Settings</h1>
      <p className="text-sm text-shell-text-secondary mb-8">
        Foundry configuration and preferences.
      </p>

      <SettingSection title="Library" icon={FolderOpen}>
        <SettingRow
          label="Library path"
          value="~/LocalDev/Design_Library"
          description="Location of the design asset library on disk"
        />
      </SettingSection>

      <SettingSection title="Appearance" icon={Palette}>
        <SettingRow
          label="Theme"
          value="Dark"
          description="Application color theme"
        />
        <SettingRow
          label="Font"
          value="System"
          description="UI font preference"
        />
      </SettingSection>

      <SettingSection title="About" icon={Info}>
        <SettingRow label="Foundry" value="v0.1.0" />
        <SettingRow label="Runtime" value="Tauri 2.x" />
        <SettingRow
          label="Build"
          value="Development"
          description="Current build configuration"
        />
      </SettingSection>
    </div>
  );
}
