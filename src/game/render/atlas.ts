import { Assets, Rectangle, Texture } from "pixi.js";

export type TextureMap = Map<string, Texture>;

export function loadImage(url: string): Promise<Texture> {
  return Assets.load<Texture>(url);
}

export function gridTile(
  sheet: Texture,
  tileNumber: number,
  tileSize = 64,
): Texture {
  const columns = Math.floor(sheet.width / tileSize);
  const index = tileNumber - 1;
  const frame = new Rectangle(
    (index % columns) * tileSize,
    Math.floor(index / columns) * tileSize,
    tileSize,
    tileSize,
  );
  return new Texture({ source: sheet.source, frame });
}

export function sheetRegion(
  sheet: Texture,
  x: number,
  y: number,
  width: number,
  height: number,
): Texture {
  return new Texture({
    source: sheet.source,
    frame: new Rectangle(x, y, width, height),
  });
}

export async function loadXmlAtlas(
  imageUrl: string,
  xmlUrl: string,
): Promise<TextureMap> {
  const [image, response] = await Promise.all([
    Assets.load<Texture>(imageUrl),
    fetch(xmlUrl),
  ]);
  if (!response.ok) {
    throw new Error(
      `Could not load atlas data: ${xmlUrl} (${response.status})`,
    );
  }

  const xml = new DOMParser().parseFromString(
    await response.text(),
    "application/xml",
  );
  const textures: TextureMap = new Map();

  for (const node of Array.from(xml.querySelectorAll("SubTexture"))) {
    const name = node.getAttribute("name");
    if (!name) continue;

    const frame = new Rectangle(
      Number(node.getAttribute("x")),
      Number(node.getAttribute("y")),
      Number(node.getAttribute("width")),
      Number(node.getAttribute("height")),
    );
    textures.set(name, new Texture({ source: image.source, frame }));
  }

  return textures;
}
