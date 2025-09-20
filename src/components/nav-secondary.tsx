export function NavSecondary({ items, className, ...props }: { items?: any[], className?: string, [key: string]: any }) {
  return (
    <nav className={`flex flex-col space-y-2 ${className || ''}`}>
      <div className="text-sm text-muted-foreground">Secondary</div>
    </nav>
  );
}