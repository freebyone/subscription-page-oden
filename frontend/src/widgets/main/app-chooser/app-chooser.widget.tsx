import {
    TSubscriptionPageAppConfig,
    TSubscriptionPagePlatformKey
} from '@remnawave/subscription-page-types'
import { Button, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { IconChevronRight, IconDownload, IconExternalLink } from '@tabler/icons-react'
import clsx from 'clsx'

import { constructSubscriptionUrl } from '@shared/utils/construct-subscription-url'
import { useSubscription } from '@entities/subscription-info-store'
import { getIconFromLibrary } from '@shared/utils/config-parser'
import { TemplateEngine } from '@shared/utils/template-engine'
import { useAppConfig } from '@entities/app-config-store'
import { vibrate } from '@shared/utils/vibrate'
import { useTranslation } from '@shared/hooks'

interface IDownloadLink {
    iconKey: string | undefined
    label: string
    platformLabel: string
    url: string
}

interface IAppEntry {
    deepLink: string | undefined
    downloads: IDownloadLink[]
    featured: boolean
    name: string
    svgIconKey: string | undefined
}

interface IProps {
    isMobile: boolean
}

export const AppChooserWidget = ({ isMobile }: IProps) => {
    const { t, baseTranslations } = useTranslation()
    const { platforms, svgLibrary } = useAppConfig()
    const subscription = useSubscription()

    const subscriptionUrl = constructSubscriptionUrl(
        window.location.href,
        subscription.user.shortUuid
    )

    const isSubscriptionActive =
        subscription.user.userStatus === 'ACTIVE' && subscription.user.daysLeft > 0

    // Один и тот же клиент (Happ, Incy, …) настраивается в панели отдельно под
    // каждую платформу. На референс-странице он показан одной секцией со списком
    // всех сборок, поэтому собираем приложения по имени через все платформы.
    const appsByName = new Map<string, IAppEntry>()

    for (const [platformKey, platformConfig] of Object.entries(platforms)) {
        if (!platformConfig) continue

        const platformLabel = t(platformConfig.displayName)

        for (const app of platformConfig.apps as TSubscriptionPageAppConfig[]) {
            let entry = appsByName.get(app.name)
            if (!entry) {
                entry = {
                    name: app.name,
                    svgIconKey: app.svgIconKey ?? undefined,
                    deepLink: undefined,
                    downloads: [],
                    featured: false
                }
                appsByName.set(app.name, entry)
            }
            // Клиент считается рекомендованным, если отмечен так хотя бы на одной
            // платформе: в панели featured проставляется отдельно в каждой.
            if (app.featured) {
                entry.featured = true
            }

            for (const block of app.blocks) {
                for (const button of block.buttons) {
                    if (button.type === 'external') {
                        const alreadyListed = entry.downloads.some((d) => d.url === button.link)
                        if (!alreadyListed) {
                            entry.downloads.push({
                                url: button.link,
                                label: t(button.text),
                                platformLabel,
                                iconKey:
                                    platformConfig.svgIconKey ?? app.svgIconKey ?? undefined
                            })
                        }
                    } else if (button.type === 'subscriptionLink' && !entry.deepLink) {
                        entry.deepLink = TemplateEngine.formatWithMetaInfo(button.link, {
                            username: subscription.user.username,
                            subscriptionUrl
                        })
                    }
                }
            }

            void (platformKey as TSubscriptionPagePlatformKey)
        }
    }

    const allApps = [...appsByName.values()]

    // Показываем только рекомендованные клиенты: иначе страница превращается в
    // список из десятка приложений вместо «выберите приложение». Набор задаётся
    // оператором флагом featured в конфиге панели. Если не отмечен ни один —
    // показываем всё, чтобы страница не осталась пустой.
    const featuredApps = allApps.filter((app) => app.featured)
    const apps = featuredApps.length > 0 ? featuredApps : allApps

    const openableApps = apps.filter((app) => app.deepLink)
    const downloadableApps = apps.filter((app) => app.downloads.length > 0)

    if (apps.length === 0) return null

    return (
        <Stack gap={isMobile ? 32 : 44}>
            <Stack gap={isMobile ? 'sm' : 'md'}>
                <div
                    className={clsx(
                        'status-pill',
                        isSubscriptionActive ? 'status-pill-active' : 'status-pill-inactive'
                    )}
                >
                    <span className="status-dot" />
                    {t(
                        isSubscriptionActive
                            ? baseTranslations.active
                            : baseTranslations.inactive
                    )}
                </div>

                <Title
                    fw={800}
                    order={1}
                    size={isMobile ? 'h2' : undefined}
                    style={{ lineHeight: 1.08 }}
                >
                    {t({ ru: 'Выберите приложение', en: 'Choose an app' })}
                </Title>

                <Text c="dimmed" size={isMobile ? 'md' : 'lg'}>
                    {t({
                        ru: 'В каком приложении добавить подписку?',
                        en: 'Which app should the subscription be added to?'
                    })}
                </Text>

                {openableApps.length > 0 && (
                    <SimpleGrid cols={{ base: 1, sm: Math.min(openableApps.length, 2) }} mt="xs">
                        {openableApps.map((app) => (
                            <Button
                                color="red"
                                fw={700}
                                key={app.name}
                                leftSection={<IconExternalLink size={22} />}
                                onClick={() => {
                                    vibrate('tap')
                                    window.open(app.deepLink!, '_blank')
                                }}
                                radius="md"
                                size={isMobile ? 'md' : 'xl'}
                                variant="filled"
                            >
                                {t({
                                    ru: `Открыть в ${app.name}`,
                                    en: `Open in ${app.name}`
                                })}
                            </Button>
                        ))}
                    </SimpleGrid>
                )}
            </Stack>

            {downloadableApps.map((app) => (
                <Stack gap="sm" key={app.name}>
                    <Title fw={600} order={4}>
                        {t({ ru: `Скачать ${app.name}`, en: `Download ${app.name}` })}
                    </Title>

                    <div className="download-card">
                        {app.downloads.map((download) => (
                            <a
                                className="download-row"
                                href={download.url}
                                key={download.url}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <span className="download-row-icon">
                                    {download.iconKey &&
                                    getIconFromLibrary(download.iconKey, svgLibrary) ? (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: getIconFromLibrary(
                                                    download.iconKey,
                                                    svgLibrary
                                                )
                                            }}
                                            style={{ display: 'flex' }}
                                        />
                                    ) : (
                                        <IconDownload size={24} />
                                    )}
                                </span>

                                <Group gap={2} style={{ flexDirection: 'column' }} wrap="nowrap">
                                    <Text fw={650} size={isMobile ? 'sm' : 'md'} w="100%">
                                        {download.platformLabel}
                                    </Text>
                                    <Text c="dimmed" size="xs" w="100%">
                                        {download.label}
                                    </Text>
                                </Group>

                                <IconChevronRight
                                    color="var(--mantine-color-gray-5)"
                                    size={20}
                                    stroke={2.5}
                                />
                            </a>
                        ))}
                    </div>
                </Stack>
            ))}
        </Stack>
    )
}
