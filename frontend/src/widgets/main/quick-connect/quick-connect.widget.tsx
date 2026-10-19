import { TSubscriptionPagePlatformKey } from '@remnawave/subscription-page-types'
import { Button, Group, Stack, Title } from '@mantine/core'
import { IconLink } from '@tabler/icons-react'

import { constructSubscriptionUrl } from '@shared/utils/construct-subscription-url'
import { useSubscription } from '@entities/subscription-info-store'
import { getIconFromLibrary } from '@shared/utils/config-parser'
import { TemplateEngine } from '@shared/utils/template-engine'
import { useAppConfig } from '@entities/app-config-store'
import { vibrate } from '@shared/utils/vibrate'
import { useTranslation } from '@shared/hooks'

interface IProps {
    isMobile: boolean
    platform: TSubscriptionPagePlatformKey | undefined
}

/**
 * Пара крупных кнопок «Открыть в <App>» для приложений, отмеченных
 * оператором как featured в конфиге Remnawave — быстрый путь к подключению
 * без похода в детальную инструкцию по установке ниже на странице.
 */
export const QuickConnectWidget = ({ isMobile, platform }: IProps) => {
    const { t } = useTranslation()
    const { platforms, svgLibrary } = useAppConfig()
    const subscription = useSubscription()

    const platformApps = (platform && platforms[platform]?.apps) || []
    const featuredApps = platformApps.filter((app) => app.featured)
    const appsToShow = (featuredApps.length > 0 ? featuredApps : platformApps.slice(0, 1)).slice(
        0,
        2
    )

    const subscriptionUrl = constructSubscriptionUrl(
        window.location.href,
        subscription.user.shortUuid
    )

    const resolveAddSubscriptionUrl = (
        app: (typeof platformApps)[number]
    ): string | undefined => {
        for (const block of app.blocks) {
            const button = block.buttons.find((b) => b.type === 'subscriptionLink')
            if (button) {
                return TemplateEngine.formatWithMetaInfo(button.link, {
                    username: subscription.user.username,
                    subscriptionUrl
                })
            }
        }
        return undefined
    }

    const actionable = appsToShow
        .map((app) => ({ app, url: resolveAddSubscriptionUrl(app) }))
        .filter((item): item is { app: (typeof platformApps)[number]; url: string } =>
            Boolean(item.url)
        )

    if (actionable.length === 0) return null

    return (
        <Stack gap={isMobile ? 'xs' : 'sm'}>
            <Title c="white" fw={600} order={5}>
                {t({
                    ru: '🚀 Быстрое подключение',
                    en: '🚀 Quick connect'
                })}
            </Title>
            <Group
                gap="sm"
                grow={!isMobile}
                style={{ flexDirection: isMobile ? 'column' : 'row' }}
            >
                {actionable.map(({ app, url }) => (
                    <Button
                        color="red"
                        key={app.name}
                        leftSection={
                            app.svgIconKey ? (
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: getIconFromLibrary(app.svgIconKey, svgLibrary)
                                    }}
                                    style={{ display: 'flex', alignItems: 'center' }}
                                />
                            ) : (
                                <IconLink size={20} />
                            )
                        }
                        onClick={() => {
                            vibrate('tap')
                            window.open(url, '_blank')
                        }}
                        radius="lg"
                        size={isMobile ? 'md' : 'lg'}
                        variant="filled"
                    >
                        {t({
                            ru: `Открыть в ${app.name}`,
                            en: `Open in ${app.name}`
                        })}
                    </Button>
                ))}
            </Group>
        </Stack>
    )
}
