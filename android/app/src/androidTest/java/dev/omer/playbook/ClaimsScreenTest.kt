package dev.omer.playbook
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
class ClaimsScreenTest {
    @get:Rule val compose = createComposeRule()
    @Test fun readyStateSubmitsEnteredAmount() {
        var amount = ""
        compose.setContent { MaterialTheme { ClaimsScreen(ClaimUiState(), { amount = it }, {}) } }
        compose.onNode(hasSetTextAction()).performTextInput("12.50")
        compose.onNodeWithText("Submit claim").performClick()
        assertEquals("12.50", amount)
    }
    @Test fun loadingDisablesSubmissionAndRetry() {
        compose.setContent { MaterialTheme { ClaimsScreen(ClaimUiState(true, true, "Submitting…"), {}, {}) } }
        compose.onNodeWithText("Submit claim").assertIsNotEnabled()
        compose.onNodeWithText("Retry pending claim").assertIsNotEnabled()
    }
    @Test fun failureOffersRetry() {
        var retries = 0
        compose.setContent { MaterialTheme { ClaimsScreen(ClaimUiState(pending = true, message = "Submission failed."), {}, { retries++ }) } }
        compose.onNodeWithText("Submission failed.").assertIsDisplayed()
        compose.onNodeWithText("Retry pending claim").performClick()
        assertEquals(1, retries)
    }
    @Test fun successHidesRetry() {
        compose.setContent { MaterialTheme { ClaimsScreen(ClaimUiState(message = "Claim submitted successfully."), {}, {}) } }
        compose.onNodeWithText("Claim submitted successfully.").assertIsDisplayed()
        compose.onNodeWithText("Retry pending claim").assertDoesNotExist()
    }
}
