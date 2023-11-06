import { ActionType } from '@/app/reducers/AppReducer'
import { useAppContext } from '@/components/AppContext'
import Button from '@/components/common/Button'
import { HiPlus } from 'react-icons/hi'
import { LuPanelLeft } from 'react-icons/lu'

export default function Navigation() {
  const { dispatch } = useAppContext()
  return (
    <div className="flex space-x-3 relative">
      <Button
        variant="outline"
        className="flex-1"
        icon={HiPlus}
        onClick={() => {
          dispatch({ type: ActionType.UPDATE, field: 'selectedChat', value: null })
        }}
      >
        新建对话
      </Button>
      <Button
        variant="outline"
        icon={LuPanelLeft}
        onClick={() => {
          dispatch({ type: ActionType.UPDATE, field: 'displayNavigation', value: false })
        }}
      ></Button>
    </div>
  )
}
