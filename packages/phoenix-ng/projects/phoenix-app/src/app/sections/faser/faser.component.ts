import { Component, type OnInit, type OnDestroy } from '@angular/core';
import {
  EventDisplayService,
  EventDataFormat,
  defaultUIMenuConfig,
} from 'phoenix-ui-components';
import {
  type Configuration,
  PresetView,
  PhoenixMenuNode,
  FaserLoader,
} from 'phoenix-event-display';
import phoenixMenuConfig from '../../../assets/files/config/phoenix-config-faser.json';

@Component({
  standalone: false,
  selector: 'app-faser',
  templateUrl: './faser.component.html',
  styleUrls: ['./faser.component.scss'],
})
export class FaserComponent implements OnInit, OnDestroy {
  phoenixMenuRoot = new PhoenixMenuNode('Phoenix Menu', 'phoenix-menu');
  loaded = false;
  loadingProgress = 0;
  eventDataImportOptions = [EventDataFormat.JSON, EventDataFormat.ZIP];
  uiConfig = { ...defaultUIMenuConfig, showEtaPhiPanel: false };
  private isDestroyed = false;

  constructor(private eventDisplay: EventDisplayService) {}

  ngOnDestroy() {
    this.isDestroyed = true;
  }

  ngOnInit() {
    const configuration: Configuration = {
      eventDataLoader: new FaserLoader(),
      presetViews: [
        new PresetView('Front View', [0, 0, -12000], [0, 0, 0], 'left-cube'),
        new PresetView('Top View', [-500, 12000, 0], [0, 0, 0], 'top-cube'),
        new PresetView('Back View', [0, 0, 12000], [0, 0, 0], 'right-cube'),
      ],
      defaultView: [4000, 4000, 4000, 0, 0, 0],
      phoenixMenuRoot: this.phoenixMenuRoot,
      defaultEventFile: {
        eventFile: 'assets/files/event_data/faser_realevent3.json',
        eventType: 'json',
      },
    };
    this.eventDisplay.init(configuration);

    const geometries: [string, string, number][] = [
      ['Calorimeter_v4.obj', 'Calorimeter', 0x8c8c8c],
      ['PreShowerStation_v3.obj', 'Preshower', 0x356aa5],
      ['TimingStation_v8.obj', 'Timing', 0x5f04b4],
      ['VetoStation_v3.obj', 'Veto', 0x04b431],
      ['TrackerStations_v6.obj', 'Tracker', 0xcccc33],
      ['Magnets_v5.obj', 'Magnets', 0xffffff],
    ];
    for (const [file, name, color] of geometries) {
      void this.eventDisplay.loadOBJGeometry(
        `assets/geometry/FASER/${file}`,
        name,
        color,
        undefined,
        false,
      );
    }

    const loadingManager = this.eventDisplay.getLoadingManager();
    loadingManager.addProgressListener((progress) => {
      if (!this.isDestroyed) this.loadingProgress = progress;
    });
    loadingManager.addLoadListenerWithCheck(() => {
      if (!this.isDestroyed) {
        // Apply saved detector settings after every geometry is registered.
        this.eventDisplay
          .getStateManager()
          .loadStateFromJSON(phoenixMenuConfig);
        this.loaded = true;
      }
    });
  }
}
