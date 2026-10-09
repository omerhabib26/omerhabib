package dev.omer.playbook

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

// One pending claim; deliberately small demo. Production needs transactional storage and real auth.
class ClaimRepository(context: Context) {
    private val preferences = context.getSharedPreferences("pending-claim", Context.MODE_PRIVATE)
    fun pending(): PendingClaim? = preferences.getString("key", null)?.let {
        PendingClaim(it, preferences.getInt("amount", 0), preferences.getString("currency", "EUR") ?: "EUR")
    }
    fun save(claim: PendingClaim): Boolean = preferences.edit().putString("key", claim.key).putInt("amount", claim.amountMinor).putString("currency", claim.currency).commit()
    fun clear(): Boolean = preferences.edit().clear().commit()
    suspend fun submit(claim: PendingClaim): String = withContext(Dispatchers.IO) {
        val connection = URL("http://10.0.2.2:3000/claims").openConnection() as HttpURLConnection
        try {
            connection.requestMethod = "POST"
            connection.connectTimeout = 10000
            connection.readTimeout = 10000
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("Authorization", "Bearer local-demo-token")
            connection.setRequestProperty("Idempotency-Key", claim.key)
            connection.outputStream.use { it.write(JSONObject().put("amountMinor", claim.amountMinor).put("currency", claim.currency).toString().toByteArray()) }
            val code = connection.responseCode
            val requestId = connection.getHeaderField("X-Request-Id") ?: "unavailable"
            if (code !in 200..299) throw IllegalStateException("HTTP $code / request $requestId")
            requestId
        } finally { connection.disconnect() }
    }
}
