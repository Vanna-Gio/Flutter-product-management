const { poolPromise, sql } = require('../db/db');

// Create Category
exports.createCategory = async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    try {
        const pool = await poolPromise;

        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('description', sql.NVarChar, description || '')
            .query(`INSERT INTO categories (name, description) VALUES (@name, @description)`);

        res.json({ message: 'Category created successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Categories (with search)
exports.getCategories = async (req, res) => {
    const search = req.query.search || '';

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('search', sql.NVarChar, `%${search}%`)
            .query(`
                SELECT id, name, description
                FROM categories
                WHERE name COLLATE Khmer_100_CI_AI LIKE @search
                ORDER BY name COLLATE Khmer_100_CI_AI
            `);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Category
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM categories WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, name)
            .input('description', sql.NVarChar, description || '')
            .query(`UPDATE categories SET name=@name, description=@description WHERE id=@id`);

        res.json({ message: 'Category updated successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM categories WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM categories WHERE id = @id');

        res.json({ message: 'Category deleted successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
