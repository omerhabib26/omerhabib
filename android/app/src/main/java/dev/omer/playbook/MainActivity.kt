package dev.omer.playbook

import android.app.Application
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID

class ClaimsViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = ClaimRepository(application)
    private val mutable = MutableStateFlow(ClaimUiState(pending = repository.pending() != null, message = if (repository.pending() != null) "Pending claim restored. Retry when ready." else "Ready to submit."))
    val state = mutable.asStateFlow()
    fun submit(amount: String) {
        if (mutable.value.busy || mutable.value.pending) return
        val minor = parseAmount(amount) ?: run { mutable.value = ClaimUiState(message = "Enter a valid amount."); return }
        execute(PendingClaim(UUID.randomUUID().toString(), minor))
    }
    fun retry() { if (!mutable.value.busy) repository.pending()?.let { execute(it) } }
    private fun execute(claim: PendingClaim) {
        mutable.value = ClaimUiState(busy = true, pending = true, message = "Submitting…")
        viewModelScope.launch {
            try {
                check(withContext(Dispatchers.IO) { repository.save(claim) }) { "Local storage unavailable" }
                val requestId = repository.submit(claim)
                check(withContext(Dispatchers.IO) { repository.clear() }) { "Could not clear pending claim" }
                Log.i("ClaimsPlaybook", "event=claim_submitted requestId=$requestId")
                mutable.value = ClaimUiState(message = "Claim submitted successfully.")
            } catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) {
                Log.i("ClaimsPlaybook", "event=claim_retry_available")
                mutable.value = ClaimUiState(pending = repository.pending() != null, message = "Submission failed. Retry the saved claim when online.")
            }
        }
    }
}
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val model: ClaimsViewModel = viewModel()
            val state by model.state.collectAsState()
            MaterialTheme { ClaimsScreen(state, model::submit, model::retry) }
        }
    }
}
@Composable
fun ClaimsScreen(state: ClaimUiState, onSubmit: (String) -> Unit, onRetry: () -> Unit) {
    var amount by remember { mutableStateOf("") }
    Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Reliable by design", style = MaterialTheme.typography.headlineMedium)
        Text("Expense claims / personal engineering demo")
        OutlinedTextField(amount, { amount = it }, label = { Text("Amount in EUR") }, enabled = !state.busy && !state.pending)
        Button(onClick = { onSubmit(amount) }, enabled = !state.busy && !state.pending) { Text("Submit claim") }
        Text(state.message)
        if (state.pending) Button(onClick = onRetry, enabled = !state.busy) { Text("Retry pending claim") }
    }
}
