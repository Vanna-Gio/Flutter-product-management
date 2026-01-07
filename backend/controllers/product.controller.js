const { poolPromise, sql } = require('../db/db');

//api/products
exports.createProduct = async (req, res) => {
  const { name, description, price, category_id, image_url } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description || '')
      .input('price', sql.Decimal(10,2), price)
      .input('image_url', sql.NVarChar, image_url || '')
      .input('category_id', sql.Int, category_id)
      .query(`
        INSERT INTO products (name, description, price, image_url, category_id)
        VALUES (@name, @description, @price, @image_url, @category_id)
      `);

    res.json({ message: 'Product created successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

//GET /api/products
exports.getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const search = req.query.search || '';
  const sortBy = req.query.sort_by === 'price' ? 'price' : 'name';
  const categoryId = req.query.category_id;

  try {
    const pool = await poolPromise;

    let whereClause = `
      WHERE p.name COLLATE Khmer_100_CI_AI LIKE @search
    `;

    if (categoryId) {
      whereClause += ` AND p.category_id = @category_id `;
    }

    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY 
        ${sortBy === 'name' 
          ? 'p.name COLLATE Khmer_100_CI_AI' 
          : 'p.price'}
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const request = pool.request()
      .input('search', sql.NVarChar, `%${search}%`)
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit);

    if (categoryId) {
      request.input('category_id', sql.Int, categoryId);
    }

    const result = await request.query(query);

    res.json(result.recordset);

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
//PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url } = req.body;

  try {
    const pool = await poolPromise;

    const check = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id FROM products WHERE id = @id');

    if (check.recordset.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description || '')
      .input('price', sql.Decimal(10,2), price)
      .input('image_url', sql.NVarChar, image_url || '')
      .query(`
        UPDATE products
        SET name=@name, description=@description, price=@price, image_url=@image_url
        WHERE id=@id
      `);

    res.json({ message: 'Product updated successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
//DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    const check = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id FROM products WHERE id = @id');

    if (check.recordset.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM products WHERE id = @id');

    res.json({ message: 'Product deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
