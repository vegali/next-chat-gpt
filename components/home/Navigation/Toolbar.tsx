import { ActionType } from '@/app/reducers/AppReducer'
import { useAppContext } from '@/components/AppContext'
import Button from '@/components/common/Button'
import { MdLightMode, MdDarkMode, MdInfo } from 'react-icons/md'

export default function Navigation() {
  const {
    state: { themeMode },
    dispatch
  } = useAppContext()
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-800 flex p-2 justify-between">
      <Button
        variant="text"
        icon={themeMode === 'dark' ? MdLightMode : MdDarkMode}
        onClick={() => {
          dispatch({ type: ActionType.UPDATE, field: 'themeMode', value: themeMode === 'dark' ? 'light' : 'dark' })
        }}
      ></Button>
      <Button variant="text" icon={MdInfo} />
    </div>
  )
}
