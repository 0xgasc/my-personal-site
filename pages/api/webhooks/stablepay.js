export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { event, orderId, amount, txHash, chain, token, status } = req.body

  if (event === 'payment.confirmed') {
    console.log(`Payment confirmed: $${amount} ${token} on ${chain}`)
    console.log(`Order: ${orderId}, TX: ${txHash}`)
  }

  res.status(200).json({ received: true })
}
