import type { NextPage } from 'next'
import { GeneralPageLayout, Layout } from './_layout'


const About: NextPage = () => {
  return (
    <GeneralPageLayout
        title='A Poorly Thought Out Test of NextJS'
        leadInText="This is probably not an appropriate project ot test using NextJS with."
    />
  )
}

export default About
