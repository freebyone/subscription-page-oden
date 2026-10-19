import { Box, Center, Container, Image, Stack, Title } from '@mantine/core'
import { TSubscriptionPagePlatformKey } from '@remnawave/subscription-page-types'

import { useAppConfig, useAppConfigStoreActions, useCurrentLang } from '@entities/app-config-store'
import { LanguagePicker } from '@shared/ui/language-picker/language-picker.shared'
import { AppChooserWidget, BenefitsWidget } from '@widgets/main'
import { Page, RemnawaveLogo } from '@shared/ui'

interface IMainPageComponentProps {
    isMobile: boolean
    platform: TSubscriptionPagePlatformKey | undefined
}

export const MainPageComponent = ({ isMobile }: IMainPageComponentProps) => {
    const config = useAppConfig()
    const currentLang = useCurrentLang()
    const { setLanguage } = useAppConfigStoreActions()

    const brandName = config.brandingSettings.title
    let hasCustomLogo = !!config.brandingSettings.logoUrl

    if (hasCustomLogo) {
        if (config.brandingSettings.logoUrl.includes('docs.rw')) {
            hasCustomLogo = false
        }
    }

    return (
        <Page>
            <Container maw={940} px={{ base: 'md', sm: 'lg', md: 'xl' }} py={{ base: 'lg', sm: 'xl' }}>
                <Stack gap={isMobile ? 32 : 48}>
                    <Box className="header-wrapper">
                        {hasCustomLogo ? (
                            <Image
                                alt="logo"
                                fit="contain"
                                src={config.brandingSettings.logoUrl}
                                style={{ width: '44px', height: '44px', flexShrink: 0 }}
                            />
                        ) : (
                            <RemnawaveLogo c="red" size={40} />
                        )}
                        <Title fw={800} ml="sm" order={2}>
                            {brandName}
                        </Title>
                    </Box>

                    <AppChooserWidget isMobile={isMobile} />

                    <BenefitsWidget isMobile={isMobile} />

                    <Center>
                        <LanguagePicker
                            currentLang={currentLang}
                            locales={config.locales}
                            onLanguageChange={setLanguage}
                        />
                    </Center>
                </Stack>
            </Container>
        </Page>
    )
}
