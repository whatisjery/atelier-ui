import { useTranslations } from "next-intl"
import DocCollapsible from "@/components/features/docs/DocCollapsible"

type InstallGuideProps = {
    promptSlot: React.ReactNode
    cliSlot: React.ReactNode
    manualSlot: React.ReactNode
}

export default function InstallGuide({ promptSlot, cliSlot, manualSlot }: InstallGuideProps) {
    const tInstall = useTranslations("docs.install")

    return (
        <>
            {promptSlot}

            <hr />

            <DocCollapsible title={tInstall("cli-title")}>
                <p>{tInstall("cli-hint")}</p>

                {cliSlot}
            </DocCollapsible>

            <hr />

            <DocCollapsible title={tInstall("manual-title")}>
                <p>{tInstall("manual-hint")}</p>

                {manualSlot}
            </DocCollapsible>
        </>
    )
}
