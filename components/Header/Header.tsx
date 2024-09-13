import User from '../User';
import classes from './Header.module.css';
import { Movimientos } from '../Contable/Movimientos';
export default async function Header() {
  return (
    <div className={classes.header}>
      <h3>eControl</h3>
      <ul className='flex flex-row gap-4'>
        <li>
          <a href="/">Inicio</a>
        </li>
        <li>
          <a href="/debits">Deudas</a>
        </li>
        <li>
          <a href="/sesionreport">Reportes</a>
        </li>
        <li >
          <Movimientos />
        </li>
      </ul>
      <User />
    </div>
  );
}
