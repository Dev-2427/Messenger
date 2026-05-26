export const formatMessageTime = (
    dateString: string
): string => {

    const date = new Date(dateString)

    const now = new Date()

    const isToday =
        date.toDateString() ===
        now.toDateString()

    const yesterday =
        new Date()

    yesterday.setDate(
        yesterday.getDate() - 1
    )

    const isYesterday =
        date.toDateString() ===
        yesterday.toDateString()

    const isSameYear =
        date.getFullYear() ===
        now.getFullYear()

    // Today → 5:30 PM
    if (isToday) {

        return date.toLocaleTimeString(
            [],
            {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }
        )
    }

    // Yesterday
    if (isYesterday) {
        return "Yesterday"
    }

    // Same year → 12 May
    if (isSameYear) {

        return date.toLocaleDateString(
            [],
            {
                day: "numeric",
                month: "short",
            }
        )
    }

    // Different year → 12 May 2023
    return date.toLocaleDateString(
        [],
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    )
}