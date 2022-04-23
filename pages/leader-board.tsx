import type { NextPage } from 'next'
import { GeneralPageLayout, Layout } from './_layout'


const LeaderBoard: NextPage = () => {
  return (
    <GeneralPageLayout
        title='Leader Board'
        leadInText='Players with the most wins.'
    />
  )
}

export default LeaderBoard
