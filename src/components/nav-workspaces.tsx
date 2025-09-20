export function NavWorkspaces({ workspaces, ...props }: { workspaces?: any[], [key: string]: any }) {
  return (
    <nav className="flex flex-col space-y-2">
      <div className="text-sm text-muted-foreground">Workspaces</div>
    </nav>
  );
}