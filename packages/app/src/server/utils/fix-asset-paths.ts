export function fixAssetPaths(html: string, assetMap: Map<string, string>): string {
    let fixed = html;
    
    // Fix paths with wrong base paths - replace /app/packages/app/src/... with ./
    // This handles cases like: /app/packages/app/src/logo-kygw735p.svg -> ./logo-kygw735p.svg
    fixed = fixed.replace(/(src|href)=["']\/app\/packages\/app\/src\/([^"']+)["']/gi, (match, attr, filename) => {
      return `${attr}="./${filename}"`;
    });
    
    // Fix http://localhost:8080 paths
    fixed = fixed.replace(/(src|href)=["']https?:\/\/[^/]+\/app\/packages\/app\/src\/([^"']+)["']/gi, (match, attr, filename) => {
      return `${attr}="./${filename}"`;
    });
    
    // Fix base names (without hash) to hashed filenames
    for (const [original, hashed] of assetMap.entries()) {
      // Skip if original already contains a hash (it's already mapped)
      if (original.match(/[a-z0-9]{8,}\./)) {
        continue;
      }
      
      // Escape special regex characters
      const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Replace in src="..." and href="..." attributes
      fixed = fixed.replace(new RegExp(`(src|href)=["']${escaped}["']`, 'gi'), (match, attr) => {
        return `${attr}="${hashed}"`;
      });
    }
    
    return fixed;
  }