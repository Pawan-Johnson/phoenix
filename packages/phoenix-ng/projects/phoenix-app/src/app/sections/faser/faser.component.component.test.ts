import { FaserComponent } from './faser.component';
import { FaserLoader } from 'phoenix-event-display';
import { EventDisplayService } from 'phoenix-ui-components';

describe('FaserComponent', () => {
  function setup() {
    let onLoaded: () => void;
    let onProgress: (value: number) => void;
    const state = { loadStateFromJSON: jest.fn() };
    const service = {
      init: jest.fn(),
      loadOBJGeometry: jest.fn().mockResolvedValue(undefined),
      getStateManager: () => state,
      getLoadingManager: () => ({
        addProgressListener: (callback: typeof onProgress) => {
          onProgress = callback;
        },
        addLoadListenerWithCheck: (callback: typeof onLoaded) => {
          onLoaded = callback;
        },
      }),
    };
    const component = new FaserComponent(
      service as unknown as EventDisplayService,
    );
    component.ngOnInit();
    return {
      component,
      service,
      state,
      loaded: () => onLoaded(),
      progress: (value: number) => onProgress(value),
    };
  }

  it('initializes FASER and registers all six detector geometries', () => {
    const { service } = setup();
    const config = service.init.mock.calls[0][0];
    expect(config.eventDataLoader).toBeInstanceOf(FaserLoader);
    expect(config.defaultEventFile.eventFile).toContain(
      'faser_realevent3.json',
    );
    expect(
      config.presetViews.every((view: any) => view.cameraTarget.length === 3),
    ).toBe(true);
    expect(service.loadOBJGeometry).toHaveBeenCalledTimes(6);
  });

  it('restores state only when resources finish loading', () => {
    const { component, state, loaded, progress } = setup();
    expect(state.loadStateFromJSON).not.toHaveBeenCalled();
    progress(50);
    expect(component.loadingProgress).toBe(50);
    loaded();
    expect(state.loadStateFromJSON).toHaveBeenCalledTimes(1);
    expect(component.loaded).toBe(true);
  });

  it('ignores loading callbacks after navigating away', () => {
    const { component, state, loaded, progress } = setup();
    component.ngOnDestroy();
    progress(100);
    loaded();
    expect(state.loadStateFromJSON).not.toHaveBeenCalled();
    expect(component.loaded).toBe(false);
  });
});
