import { Assets, Rectangle, Texture } from 'pixi.js';

export type TextureMap = Map<string, Texture>;

export async function loadXmlAtlas(imageUrl: string, xmlUrl: string): Promise<TextureMap> {
  const [image, response] = await Promise.all([
    Assets.load<Texture>(imageUrl),
    fetch(xmlUrl),
  ]);
  if (!response.ok) {
    throw new Error(`Could not load atlas data: ${xmlUrl} (${response.status})`);
  }

  const xml = new DOMParser().parseFromString(await response.text(), 'application/xml');
  const textures: TextureMap = new Map();

  for (const node of Array.from(xml.querySelectorAll('SubTexture'))) {
    const name = node.getAttribute('name');
    if (!name) continue;

    const frame = new Rectangle(
      Number(node.getAttribute('x')),
      Number(node.getAttribute('y')),
      Number(node.getAttribute('width')),
      Number(node.getAttribute('height')),
    );
    textures.set(name, new Texture({ source: image.source, frame }));
  }

  return textures;
}