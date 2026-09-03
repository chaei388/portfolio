import { navigationItems } from '../../../data/navigation'

function Navigation() {
  return (
    <nav>
      <ul>
        {navigationItems.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navigation
