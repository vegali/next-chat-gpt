'use client'
import { ActionType } from '@/app/reducers/AppReducer'
import { useAppContext } from '@/components/AppContext'
import Button from '@/components/common/Button'
import { LuPanelLeft } from 'react-icons/lu'

export default function Menu() {
  const {
    state: { displayNavigation },
    dispatch
  } = useAppContext()
  return (
    <Button
      variant="outline"
      className={`${displayNavigation ? 'hidden' : ''} fixed left-2 top-2`}
      icon={LuPanelLeft}
      onClick={() => {
        dispatch({ type: ActionType.UPDATE, field: 'displayNavigation', value: true })
      }}
    ></Button>
  )
}
