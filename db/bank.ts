import { MongoClient, ObjectId, ClientSession } from "mongodb";

const uri = "mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0";
const client = new MongoClient(uri);

interface Account {
  _id?: ObjectId;
  name: string;
  balance: number;
}

async function withTransaction(fn: (session: ClientSession) => Promise<void>) {
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await fn(session);
    }, {
      readConcern: { level: "local" },
      writeConcern: { w: "majority" },
      readPreference: "primary"
    });
  } finally {
    await session.endSession();
  }
}

async function transferMoney(
  fromId: ObjectId,
  toId: ObjectId,
  amount: number
) {
  const db = client.db("BankDB");
  const accounts = db.collection<Account>("Accounts");

  await withTransaction(async (session) => {
    const from = await accounts.findOne({ _id: fromId }, { session });
    if (!from || from.balance < amount) {
      throw new Error("Insufficient funds");
    }

    await accounts.updateOne(
      { _id: fromId },
      { $inc: { balance: -amount } },
      { session }
    );
    await accounts.updateOne(
      { _id: toId },
      { $inc: { balance: amount } },
      { session }
    );
    console.log(
      `Transferred $${amount} from ${fromId} to ${toId} successfully.`
    );
  });
}

async function main() {
  await client.connect();
  const db = client.db("BankDB");
  const accounts = db.collection<Account>("Accounts");
  await accounts.deleteMany({}); // clean slate

  // Seed two accounts
  const [aliceRes, bobRes] = await Promise.all([
    accounts.insertOne({ name: "Alice", balance: 1000 }),
    accounts.insertOne({ name: "Bob", balance: 500 })
  ]);
  const aliceId = aliceRes.insertedId;
  const bobId = bobRes.insertedId;
  console.log("Seeded accounts:", aliceId, bobId);

  // 2.3.1 Successful transfer
  try {
    await transferMoney(aliceId, bobId, 200);
  } catch (e) {
    console.error("Unexpected failure:", e);
  }

  // 2.3.2 Failed transfer (simulate error)
  try {
    await transferMoney(aliceId, bobId, 2000);
  } catch (e) {
    console.error("Expected failure:", e.message);
  }

  // Show final balances
  const final = await accounts.find().toArray();
  console.table(final.map(a => ({
    name: a.name,
    balance: a.balance
  })));

  await client.close();
}

main().catch(console.error);
