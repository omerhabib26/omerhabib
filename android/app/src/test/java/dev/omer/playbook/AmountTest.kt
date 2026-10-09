package dev.omer.playbook
import org.junit.Assert.*
import org.junit.Test
class AmountTest {
    @Test fun validAmountUsesMinorUnits() { assertEquals(1250, parseAmount("12.50")) }
    @Test fun invalidAmountsAreRejected() { listOf("0", "-1", "NaN", "0.001", "1000001", "").forEach { assertNull(parseAmount(it)) } }
}
