import styles from "./page.module.scss";
import Map from './components/map';
import { MapType } from './components/map-types';

export default function Home() {
  return (
    <div className={styles.page}>
      <Map location={{ longitude: 34.8532, latitude: 32.3215 }} showMarker mapType={MapType.STREETS} />
    </div>
  );
}
