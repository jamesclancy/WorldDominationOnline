import type { NextPage } from "next";
import Link from "next/link";
import { GeneralPageLayout, Layout } from "./_layout";

const Rules: NextPage = () => {
  return (
    <GeneralPageLayout
      title="Rules/What the game actual is"
      leadInText="I had to google the rules for this despite playing it a lot as a kid."
    >
      <p>
        This&nbsp;
        <Link href="https://howdoyouplayit.com/risk-how-do-you-play-risk/">
          article
        </Link>
        &nbsp; seemed to be decent walk through.
      </p>
    </GeneralPageLayout>
  );
};

export default Rules;
