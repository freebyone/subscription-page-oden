import { IconBolt, IconEyeOff, IconShieldCheck } from '@tabler/icons-react'
import { SimpleGrid, Stack, Text } from '@mantine/core'

import { useTranslation } from '@shared/hooks'

const ITEMS = [
    {
        icon: IconShieldCheck,
        title: { ru: 'Безопасно', en: 'Secure' },
        description: {
            ru: 'Надёжное шифрование и защита данных',
            en: 'Strong encryption and data protection'
        }
    },
    {
        icon: IconEyeOff,
        title: { ru: 'Приватно', en: 'Private' },
        description: { ru: 'Никаких логов и слежки', en: 'No logs, no tracking' }
    },
    {
        icon: IconBolt,
        title: { ru: 'Быстро', en: 'Fast' },
        description: {
            ru: 'Высокая скорость без ограничений',
            en: 'High speed, no limits'
        }
    }
]

interface IProps {
    isMobile: boolean
}

export const BenefitsWidget = ({ isMobile }: IProps) => {
    const { t } = useTranslation()

    return (
        <SimpleGrid
            cols={{ base: 1, sm: 3 }}
            spacing={isMobile ? 'md' : 'xl'}
            style={{
                borderTop: '1px solid var(--mantine-color-gray-3)',
                paddingTop: 'var(--mantine-spacing-xl)'
            }}
        >
            {ITEMS.map((item) => (
                <Stack align={isMobile ? 'center' : 'flex-start'} gap={4} key={item.title.ru}>
                    <item.icon color="var(--mantine-color-red-7)" size={30} stroke={1.9} />
                    <Text fw={700} size="md" ta={isMobile ? 'center' : 'left'}>
                        {t(item.title)}
                    </Text>
                    <Text c="dimmed" size="sm" ta={isMobile ? 'center' : 'left'}>
                        {t(item.description)}
                    </Text>
                </Stack>
            ))}
        </SimpleGrid>
    )
}
