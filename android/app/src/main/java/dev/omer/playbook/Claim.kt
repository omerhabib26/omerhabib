package dev.omer.playbook

import java.math.BigDecimal
import java.math.RoundingMode

data class PendingClaim(val key: String, val amountMinor: Int, val currency: String = "EUR")
data class ClaimUiState(val busy: Boolean = false, val pending: Boolean = false, val message: String = "Ready to submit.")

fun parseAmount(text: String): Int? = try {
    val value = BigDecimal(text).setScale(2, RoundingMode.UNNECESSARY).movePointRight(2).intValueExact()
    value.takeIf { it in 1..100000000 }
} catch (_: ArithmeticException) { null } catch (_: NumberFormatException) { null }
