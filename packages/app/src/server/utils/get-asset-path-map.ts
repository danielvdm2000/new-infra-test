import { readdir } from "fs/promises";
import { join } from "path";

// Cache for asset path mapping
let assetPathMap: Map<string, string> | null = null;

export async function getAssetPathMap(): Promise<Map<string, string>> {
  if (assetPathMap) return assetPathMap;

  assetPathMap = new Map();
  const distPath = join(process.cwd(), "dist");

  try {
    const files = await readdir(distPath);
    
    // Map hashed filenames to their base names and various path patterns
    for (const file of files) {
      // Match pattern: name-hash.ext
      const match = file.match(/^(.+)-([a-z0-9]+)\.(svg|png|jpg|jpeg|gif|webp|ico)$/);
      if (match) {
        const [, baseName, hash, ext] = match;
        const hashedPath = `./${file}`;
        
        // Map base name to hashed filename
        assetPathMap.set(`./${baseName}.${ext}`, hashedPath);
        
        // Map various absolute path patterns to hashed filename
        const pathPatterns = [
          `/app/packages/app/src/${baseName}.${ext}`,
          `/app/packages/app/src/${file}`,
          `http://localhost:8080/app/packages/app/src/${baseName}.${ext}`,
          `http://localhost:8080/app/packages/app/src/${file}`,
          `//localhost:8080/app/packages/app/src/${baseName}.${ext}`,
          `//localhost:8080/app/packages/app/src/${file}`,
        ];
        
        for (const pattern of pathPatterns) {
          assetPathMap.set(pattern, hashedPath);
        }
        
        // Also map the hashed filename with wrong paths to correct path
        assetPathMap.set(`/app/packages/app/src/${file}`, hashedPath);
        assetPathMap.set(`http://localhost:8080/app/packages/app/src/${file}`, hashedPath);
      }
    }
  } catch (error) {
    console.warn("Failed to build asset path map:", error);
  }

  return assetPathMap;
}