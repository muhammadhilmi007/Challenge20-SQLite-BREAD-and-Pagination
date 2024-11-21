import sqlite3 from 'sqlite3';
const db = new sqlite3.Database("./database/data.db");

class Data {
    static getAll(page = 1, limit = 5, filter = {}, operation = 'OR', callback) {
        let countQuery = "SELECT COUNT(*) as total FROM data WHERE 1=1";
        let query = "SELECT * FROM data WHERE 1=1";
        const params = [];
        const countParams = [];
        const conditions = [];

        // Filter nama menggunakan LIKE
        if (filter.name) {
            conditions.push('name LIKE ?');
            params.push(`%${filter.name}%`);
            countParams.push(`%${filter.name}%`);
        }
        
        // Filter tinggi menggunakan operator =
        if (filter.height) {
            conditions.push('height = ?');
            params.push(filter.height);
            countParams.push(filter.height);
        }
        
        // Filter berat menggunakan operator =
        if (filter.weight) {
            conditions.push('weight = ?');
            params.push(filter.weight);
            countParams.push(filter.weight);
        }
        
        // Filter tanggal lahir menggunakan BETWEEN
        if (filter.startDate || filter.endDate) {
            let dateCondition = 'birthdate';
            if (filter.startDate && filter.endDate) {
                dateCondition += ' BETWEEN ? AND ?';
                params.push(filter.startDate, filter.endDate);
                countParams.push(filter.startDate, filter.endDate);
            } else if (filter.startDate) {
                dateCondition += ' >= ?';
                params.push(filter.startDate);
                countParams.push(filter.startDate);
            } else if (filter.endDate) {
                dateCondition += ' <= ?';
                params.push(filter.endDate);
                countParams.push(filter.endDate);
            }
            conditions.push(dateCondition);
        }
        
        // Filter status pernikahan
        if (filter.isMarried !== undefined) {
            conditions.push('married = ?');
            params.push(filter.isMarried);
            countParams.push(filter.isMarried);
        }

        // Gabungkan kondisi dengan operator yang dipilih (AND/OR)
        if (conditions.length > 0) {
            const conditionString = ` AND (${conditions.join(` ${operation} `)})`;
            query += conditionString;
            countQuery += conditionString;
        }

        // Hitung total data terlebih dahulu
        db.get(countQuery, countParams, (err, result) => {
            if (err) {
                return callback(err);
            }

            const total = result.total;
            const totalPages = Math.ceil(total / limit);

            // Tambahkan pagination
            query += ' LIMIT ? OFFSET ?';
            params.push(limit, (page - 1) * limit);

            // Ambil data dengan pagination
            db.all(query, params, (err, rows) => {
                if (err) {
                    return callback(err);
                }
                callback(null, rows, totalPages);
            });
        });
    }

    static add(data, callback) {
        const query = 'INSERT INTO data (name, height, weight, birthdate, married) VALUES (?, ?, ?, ?, ?)';
        const marriedValue = data.married === "true" ? 1 : 0;
        return db.run(query, [data.name, data.height, data.weight, data.birthdate, marriedValue], callback);
    }

    static update(id, data, callback) {
        const query = 'UPDATE data SET name =?, height =?, weight =?, birthdate =?, married =? WHERE id =?';
        const marriedValue = data.married === "true" ? 1 : 0;
        return db.run(query, [data.name, data.height, data.weight, data.birthdate, marriedValue, id], callback);
    }

    static delete(id, callback) {
        const query = 'DELETE FROM data WHERE id = ?';
        return db.run(query, [id], callback);
    }

    static getById(id, callback) {
        const query = 'SELECT * FROM data WHERE id = ?';
        return db.get(query, [id], callback);
    }
}

export default Data;
