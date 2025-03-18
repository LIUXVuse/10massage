const { Client } = require('pg');
require('dotenv').config();

async function main() {
  // 从.env文件获取数据库连接字符串
  const connectionString = process.env.DATABASE_URL || process.env.NEON_POSTGRES_PRISMA_URL;
  
  if (!connectionString) {
    console.error('错误: 未找到数据库连接字符串。请确保.env文件中包含DATABASE_URL或NEON_POSTGRES_PRISMA_URL');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('成功连接到Neon数据库!');

    // 查询所有表
    console.log('\n获取数据库中的所有表:');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    const tables = tablesResult.rows.map(row => row.table_name);
    
    console.log('数据库中的表:');
    console.log(tables);

    // 对每个表进行查询，获取记录数和样本数据
    for (const table of tables) {
      console.log(`\n表 "${table}" 的信息:`);
      
      // 获取表的记录数
      const countQuery = `SELECT COUNT(*) FROM "${table}";`;
      const countResult = await client.query(countQuery);
      const recordCount = parseInt(countResult.rows[0].count);
      
      console.log(`记录数: ${recordCount}`);
      
      if (recordCount > 0) {
        // 获取表的样本数据（最多5条）
        const sampleQuery = `SELECT * FROM "${table}" LIMIT 5;`;
        const sampleResult = await client.query(sampleQuery);
        
        console.log('样本数据:');
        console.log(JSON.stringify(sampleResult.rows, null, 2));
      } else {
        console.log('表中没有数据');
      }
    }

  } catch (error) {
    console.error('查询数据库时出错:', error);
  } finally {
    await client.end();
    console.log('\n数据库连接已关闭');
  }
}

main(); 