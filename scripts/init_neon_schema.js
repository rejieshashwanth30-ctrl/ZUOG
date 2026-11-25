const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (hostname.includes('neon.tech')) {
    dns.resolve4(hostname, (err, addresses) => {
      if (err) return originalLookup(hostname, options, callback);
      if (options && options.all) {
        return callback(null, addresses.map((a) => ({ address: a, family: 4 })));
      }
      return callback(null, addresses[0], 4);
    });
  } else {
    originalLookup(hostname, options, callback);
  }
};

const { neon } = require('@neondatabase/serverless');
const { execSync } = require('child_process');

async function initSchema() {
  console.log('Generating latest DDL from prisma/schema.prisma...');
  const ddlSql = execSync('npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script', {
    encoding: 'utf-8',
  });

  console.log(`Connecting to Neon PostgreSQL...`);
  const sql = neon(process.env.DATABASE_URL);

  const cleanSql = ddlSql.replace(/--.*$/gm, '');
  const statements = cleanSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Executing ${statements.length} DDL statements on Neon PostgreSQL...`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await sql.query(stmt);
      const firstLine = stmt.replace(/\s+/g, ' ').substring(0, 60);
      console.log(`[${i + 1}/${statements.length}] Executed: ${firstLine}...`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`[${i + 1}/${statements.length}] Notice (already exists): ${stmt.replace(/\s+/g, ' ').substring(0, 60)}`);
      } else {
        console.error(`[${i + 1}/${statements.length}] Statement failed:`, stmt);
        throw err;
      }
    }
  }

  console.log('\n--- Verifying Tables Created in Neon ---');
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  console.log('Created tables in Neon PostgreSQL:');
  tables.forEach((t) => console.log(' - ' + t.table_name));
}

initSchema().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
