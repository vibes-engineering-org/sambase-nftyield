export function NavMain({ items, ...props }: { items?: any[], [key: string]: any }) {
  return (
    <nav className="flex flex-col space-y-2">
      <div className="text-sm text-muted-foreground">Navigation</div>
    </nav>
  );
}