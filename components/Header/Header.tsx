import User from '../User';
import classes from './Header.module.css';

export default async function Header() {
  return (
    <div className={classes.header}>
      <h3>eControl</h3>
      <ul className='flex flex-row gap-4'>
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/debits">Deudas</a>
        </li>
        <li>
          <a href="/sesionreport">Reportes</a>
        </li>
      </ul>
      <User />
    </div>
  );
}
