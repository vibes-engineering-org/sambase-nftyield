export function NavFavorites({ favorites, ...props }: { favorites?: any[], [key: string]: any }) {
  return (
    <nav className="flex flex-col space-y-2">
      <div className="text-sm text-muted-foreground">Favorites</div>
    </nav>
  );
}