/** @jest-environment jsdom */
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { Group, Mesh } from 'three';
import { FaserLoader } from '../../loaders/faser-loader';
import { FaserObjects } from '../../loaders/objects/faser-objects';
import { ThreeManager } from '../../managers/three-manager';
import { UIManager } from '../../managers/ui-manager';
import { InfoLogger } from '../../helpers/info-logger';

jest.mock('../../managers/three-manager');

const eventsDirectory = resolve(
  __dirname,
  '../../../../phoenix-ng/projects/phoenix-app/src/assets/files/event_data',
);
const eventFiles = readdirSync(eventsDirectory).filter((file) =>
  /^faser_.*\.json$/.test(file),
);

describe('FASER migration', () => {
  it.each(eventFiles)(
    'loads every event in %s with current Phoenix menus',
    (file) => {
      const loader = new FaserLoader();
      const logger = new InfoLogger();
      const graphics = new ThreeManager(logger);
      const ui = new UIManager(graphics);
      const groups: Record<string, Group> = {};
      jest
        .spyOn(graphics, 'addEventDataTypeGroup')
        .mockImplementation((name) => {
          groups[name] = new Group();
          return groups[name];
        });
      const events = JSON.parse(
        readFileSync(resolve(eventsDirectory, file), 'utf8'),
      );
      for (const name of loader.getEventsList(events)) {
        loader.buildEventData(events[name], graphics, ui, logger);
        for (const type of [
          'Tracks',
          'LargeScintHits',
          'TimingScintHits',
          'CaloClusters',
        ]) {
          const collections = events[name][type];
          if (!collections) continue;
          for (const [collection, objects] of Object.entries(collections)) {
            if ((objects as any[]).length) {
              expect(
                groups[type].children.find((child) => child.name === collection)
                  ?.children.length,
              ).toBeGreaterThan(0);
            }
          }
        }
      }
    },
  );

  it('renders two-point tracks and skips tracks without positions', () => {
    expect(
      FaserObjects.getTrack({
        pos: [
          [0, 0, 0],
          [100, 0, 0],
        ],
      })?.children,
    ).toHaveLength(2);
    expect(FaserObjects.getTrack({})).toBeUndefined();
  });

  it('preserves FASER scintillator threshold colors and dimensions', () => {
    const below = FaserObjects.getLargeScintHits({
      x: 0,
      y: 0,
      z: 0,
      energy: 500,
    }) as Mesh;
    expect((below.geometry as any).parameters.width).toBe(130);
    const above = FaserObjects.getTimingScintHits({
      x: 0,
      y: 0,
      z: 0,
      energy: 1100,
    }) as Mesh;
    expect((above.material as any).color.getHex()).toBe(0x00ff40);
  });

  it('places vertices at the supplied z coordinate', () => {
    expect(
      FaserObjects.getVertex({ x: 1, y: 2, z: 3 }).position.toArray(),
    ).toEqual([1, 2, 3]);
  });
});
