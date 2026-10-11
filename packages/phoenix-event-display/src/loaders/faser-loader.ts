import { Group, type Object3D } from 'three';
import { PhoenixLoader } from './phoenix-loader';
import { FaserObjects } from './objects/faser-objects';
import { type ObjectTypeConfig } from './object-type-registry';

/** Phoenix JSON loader with FASER calorimeter and scintillator rendering. */
export class FaserLoader extends PhoenixLoader {
  protected getObjectTypeConfigs(): ObjectTypeConfig[] {
    const renderers = {
      Tracks: FaserObjects.getTrack,
      Hits: FaserObjects.getHits,
      CaloClusters: FaserObjects.getCluster,
      Vertices: FaserObjects.getVertex,
      Muons: this.getMuon,
    };
    const configs = super.getObjectTypeConfigs().map((config) => ({
      ...config,
      getObject: renderers[config.typeName] ?? config.getObject,
      // FASER hits are individual objects or arrays of positions.
      concatonateObjs:
        config.typeName === 'Hits' ? false : config.concatonateObjs,
    }));
    return [
      ...configs,
      { typeName: 'LargeScintHits', getObject: FaserObjects.getLargeScintHits },
      {
        typeName: 'TimingScintHits',
        getObject: FaserObjects.getTimingScintHits,
      },
    ];
  }

  protected getMuon(muonParams: any): Object3D {
    const muonScene = new Group();
    if ('LinkedClusters' in muonParams) {
      for (const clusterID of muonParams.LinkedClusters) {
        const clusterColl = clusterID.split(':')[0];
        const clusterIndex = clusterID.split(':')[1];

        if (
          clusterColl &&
          clusterIndex &&
          this.eventData.CaloClusters &&
          this.eventData.CaloClusters[clusterColl]
        ) {
          const clusterParams =
            this.eventData.CaloClusters[clusterColl][clusterIndex];
          if (clusterParams) {
            const cluster = FaserObjects.getCluster(clusterParams);
            muonScene.add(cluster);
          }
        }
      }
    }
    if ('LinkedTracks' in muonParams) {
      for (const trackID of muonParams.LinkedTracks) {
        const trackColl = trackID.split(':')[0];
        const trackIndex = trackID.split(':')[1];

        if (
          trackColl &&
          trackIndex &&
          this.eventData.Tracks &&
          this.eventData.Tracks[trackColl]
        ) {
          const trackParams = this.eventData.Tracks[trackColl][trackIndex];
          if (trackParams) {
            const track = FaserObjects.getTrack(trackParams);
            if (track) muonScene.add(track);
          }
        }
      }
    }
    // uuid for selection of muons from the collections info panel
    muonParams.uuid = muonScene.uuid;
    muonScene.name = 'Muon';
    // add to scene
    return muonScene;
  }
}
