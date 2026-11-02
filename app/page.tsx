import styles from "./page.module.scss";
import Map from './components/map';

export default function Home() {
  return (
    <div className={styles.page}>
      <Map/>
    </div>
  );
}
