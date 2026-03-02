export function Topbar() {
  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-6">
      <div className="flex items-center md:hidden">
        <span className="font-bold text-lg tracking-tight">Rusun Harum</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center space-x-4">
        <span className="text-sm text-muted-foreground">Admin</span>
      </div>
    </header>
  );
}
