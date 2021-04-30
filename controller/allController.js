const validator = require('validator')
const db = require('./../connection/connection')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const register = (req, res) => {
    try {
        let data = req.body

        if(!data.username || !data.email || !data.password) throw {message: 'Data belum lengkap'}
        if(!(validator.isEmail(data.email))) throw {message: 'Email invalid'}
        if(data.username.length < 6) throw {message: 'Username minimal 6 karakter'}
        if(data.password.length < 6 || data.password.search(/[0-9]/) < 0 || data.password.search(/[!@#$%^&*]/) < 0 ) 
        throw {message: 'password minimal 6 karakter, harus mengandung angka, dan spesial karakter !@#$%^&*'}

        db.query('SELECT * FROM users WHERE email = ? OR username = ?', [data.email, data.username], (err, result) => {
            try {
                if(err) throw err
                
                if(result.length >= 1){
                    res.status(200).send({
                        error: true,
                        message: 'Email atau username sudah digunakan'
                    })
                }else{
                    let date = Date.now()
                    
                    let dataToSend = {
                        uid: date,
                        username: data.username,
                        email: data.email,
                        password: data.password
                    }
                    
                    db.query('INSERT INTO users SET ?', dataToSend, (err, result) => {
                        try {
                            if(err) throw err

                            let id = result.insertId
                            db.query('SELECT * FROM users WHERE id = ?', id, (err, result) => {
                                try {
                                   if(err) throw err 
                                    let uid = result[0].uid
                                    let username = result[0].username
                                    let email = result[0].email
                                    let role = result[0].role
                                    jwt.sign({uid: uid, role: role}, process.env.DB_TOKEN, (err, result) => {
                                       try {
                                           if(err) throw err

                                           let data = {
                                               id: id,
                                               uid: uid,
                                               username: username,
                                               email: email,
                                               token: result
                                           }
                                           res.status(200).send({
                                               error: false,
                                               message: 'Register Success',
                                               data: data
                                           })
                                       } catch (error) {
                                           res.status(500).send({
                                               errorr: true,
                                               message: 'Generate token error'
                                           })
                                       }
                                    })
                                } catch (error) {
                                    res.status(500).send({
                                        error: true,
                                        message: error.message
                                    })
                                }
                            })
                        } catch (error) {
                            res.status(500).send({
                                error: true,
                                message: 'Insert Data Error',
                                detail: error.message
                            })
                        }
                    })
                }
            } catch (error) {
                res.status(500).send({
                    error: true,
                    message: error.message
                })
            }
        })

        console.log(data)
    } catch (error) {
        res.status(406).send({
            error: true,
            message: error.message
        })
    }
}

const login = (req, res) => {
    try {
        const data = req.body
        
        if(!data.password) throw {message: 'password harus diisi'}
        if(data.user && !data.email){
            db.query('SELECT * FROM users WHERE username = ? AND password = ? AND status = 1', [data.user, data.password], (err, result) => {
                try {
                    if(err) throw err
                    console.log('masuk ke user')
                    if(result.length === 0){
                        return res.status(200).send({
                            error: true,
                            message: 'username atau password salah'
                        })
                    }

                    let id = result[0].id
                    let uid = result[0].uid
                    let email = result[0].email 
                    let status =  result[0].status
                    let role =  result[0].role
                    let username = result[0].username

                    jwt.sign({uid: uid, role: role}, process.env.DB_TOKEN, (err, result) => {
                        try {
                            if(err) throw err
                            let dataToSend = {
                                id: id,
                                uid: uid,
                                username: username,
                                email: email,
                                status: status,
                                role: role,
                                token: result
                            }
                            res.status(200).send({
                                error: false,
                                message: 'Login Success',
                                data: dataToSend
                            })
                        } catch (error) {
                            res.status(500).send({
                                error: true,
                                mesage: error.mesage
                            })
                        }
                    })

                } catch (error) {
                    res.status(500).send({
                        error: true,
                        message: error.message
                    })
                }
            })
        }else if(data.email && !data.user){
            console.log('masuk ke email')
            db.query('SELECT * FROM users WHERE email = ? AND password = ? AND status = 1', [data.email, data.password], (err, result) => {
                try {
                    if(err) throw err

                    if(result.length === 0){
                        return res.status(200).send({
                            error: true,
                            message: 'email atau password salah'
                        })
                    }

                    let id = result[0].id
                    let uid = result[0].uid
                    let email = result[0].email 
                    let status =  result[0].status
                    let role =  result[0].role
                    let username = result[0].username

                    jwt.sign({uid: uid, role: role}, process.env.DB_TOKEN, (err, result) => {
                        try {
                            if(err) throw err
                            let dataToSend = {
                                id: id,
                                uid: uid,
                                username: username,
                                email: email,
                                status: status,
                                role: role,
                                token: result
                            }
                            res.status(200).send({
                                error: false,
                                message: 'Login Success',
                                data: dataToSend
                            })
                        } catch (error) {
                            res.status(500).send({
                                error: true,
                                mesage: error.mesage
                            })
                        }
                    })

                } catch (error) {
                    res.status(500).send({
                        error: true,
                        message: error.message
                    })
                }
            })
        }else if(!data.email && !data.email){
            throw {message: 'Masukkan email atau username'}
        }
    } catch (error) {
        res.status(406).send({
            error: true,
            message: error.message
        })
    }
}

const deactivateAccount = (req, res) => {
    try {
        let data = req.dataToken

        db.query('SELECT * FROM users where uid = ?', data.uid, (err, result) => {
            try {
                if(err) throw err

                if(result[0].status !== 1){
                    return res.status(200).send({
                        error: true,
                        message: 'Akun sudah pernah dinonaktifkan'
                    })
                }

                db.query('UPDATE users SET status = 2 WHERE uid = ?', data.uid, (err, result) => {
                    try {
                        if(err) throw err

                        db.query('SELECT uid, s.status FROM backend_2021.users u JOIN status s ON s.id = u.status WHERE uid = ?', data.uid, (err, result) => {
                            try {
                                if(err) throw err

                                let dataToSend = {
                                    uid: result[0].uid,
                                    status: result[0].status
                                }

                                res.status(200).send({
                                    error: false,
                                    message: 'Akun berhasil dinonaktifkan',
                                    data: dataToSend
                                })
                            } catch (error) {
                                res.status(500).send({
                                    error: true,
                                    message: error.message
                                })
                            }
                        })


                    } catch (error) {
                        res.status(500).send({
                            error: true,
                            message: error.message
                        })
                    }
                })
            } catch (error) {
                res.status(500).send({
                    error: true,
                    message: error.message
                })
            }
        })
    } catch (error) {
        res.status(406).send({
            error: true,
            message: error.mesage
        })
    }
}
[]
const activateAccount = (req, res) => {
    try {
        let data = req.dataToken

        db.query('SELECT * FROM users WHERE uid = ?', data.uid, (err, result) => {
            try {
                if(err) throw err

                if(result[0].status === 1){
                    return res.status(200).send({
                        error: true,
                        message: 'Akunmu sudah pernah diaktifkan'
                    })
                }

                if(result[0].status === 3){
                    return res.status(200).send({
                        error: true,
                        message: 'Akunmu tidak dapat diaktifkan kembali'
                    })
                }

                db.query('UPDATE users SET status = 1 WHERE uid = ?', data.uid, (err, result) => {
                    try {
                        if(err) throw err

                        db.query('SELECT uid, s.status FROM backend_2021.users u JOIN status s ON s.id = u.status WHERE uid = ?', data.uid, (err, result) => {
                            try {
                                if(err) throw err

                                let dataToSend = {
                                    uid: result[0].uid,
                                    status: result[0].status
                                }

                                res.status(200).send({
                                    error: false,
                                    message: 'Akun berhasil aktifkan',
                                    data: dataToSend
                                })
                            } catch (error) {
                                res.status(500).send({
                                    error: true,
                                    message: error.message
                                })
                            }
                        })
                    } catch (error) {
                        res.status(500).send({
                            error: true,
                            message: error.message
                        })
                    }
                })
            } catch (error) {
                res.status(500).send({
                    error: true,
                    message: error.message
                })
            }
        })
    } catch (error) {
        
    }
}

const closeAccount = (req, res) => {
    try {
        const data = req.dataToken

        db.query('SELECT * FROM users WHERE uid = ?', data.uid, (err, result) => {
            try {
                if(err) throw err

                if(result[0].status === 3){
                    return res.status(200).send({
                        error: true,
                        message: 'Akun sudah pernah ditutup'
                    })
                }

                db.query('UPDATE users SET status = 3 WHERE uid = ?', data.uid, (err, result) => {
                    try {
                        if(err) throw err

                        db.query('SELECT uid, s.status FROM backend_2021.users u JOIN status s ON s.id = u.status WHERE uid = ?', data.uid, (err, result) => {
                            try {
                                if(err) throw err

                                let dataToSend = {
                                    uid: result[0].uid,
                                    status: result[0].status
                                }

                                res.status(200).send({
                                    error: false,
                                    message: 'Akun berhasil ditutup selamanya',
                                    data: dataToSend
                                })
                            } catch (error) {
                                res.status(500).send({
                                    error: true,
                                    message: error.message
                                })
                            }
                        })
                    } catch (error) {
                        res.status(500).send({
                            error: true,
                            message: error.message
                        })
                    }
                })
            } catch (error) {
                res.status(500).send({
                    error: true,
                    message: error.message
                })
            }
        })
    } catch (error) {
        
    }
}

const getAllMovies = (req, res) => {
    try {
        query = `SELECT name, release_date, release_month, release_year, duration_min, genre, description, ms.status, location, time FROM movies m 
                JOIN movie_status ms ON m.status = ms.id
                JOIN schedules s ON s.movie_id = m.id 
                JOIN locations l ON l.id = s.location_id 
                JOIN show_times st ON st.id = s.time_id;`
        db.query(query, (err, result) => {
            try {
                if(err) throw err
                console.log(result.length)
                res.status(200).send({
                    error: false,
                    message: 'Get All Movies Success',
                    result: result
                })
            } catch (error) {
                res.status(500).send({
                    error: true,
                    message: error.message
                })
            }
        })
    } catch (error) {
        
    }
}

const getCertainMovie = (req, res) => {
    try {
        let data = req.query

        let status = data.status.replace('%', ' ')
        let time = data.time.replace('%', ' ')
        let location = data.location

        let query = `SELECT name, release_date, release_month, release_year, duration_min, genre, description, ms.status, location, time FROM movies m 
        JOIN movie_status ms ON m.status = ms.id
        JOIN schedules s ON s.movie_id = m.id 
        JOIN locations l ON l.id = s.location_id 
        JOIN show_times st ON st.id = s.time_id
        WHERE location = ? AND time = ?`

        db.query(query, [location, time], (err, result) => {
            try {
                if(err) throw err

                res.status(200).send({
                    error: false,
                    message: 'Get movie success',
                    result: result
                })
            } catch (error) {
                res.status(500).send({
                    error: true,
                    message: error.message
                })
            }
        })
    } catch (error) {
        res.status(406).send({
            error: true,
            message: error
        })
    }
}

const addMovie = (req, res) => {
    try {
        const token = req.dataToken
        const data = req.body

        if(!data.name || !data.genre || !data.release_date || !data.release_month || !data.release_year || !data.duration_min || !data.description) throw {message: 'Masukkan semua data'}
        delete data.token

        console.log(data)
        console.log(token)

        db.query('SELECT * FROM users WHERE uid = ? AND role = 1', token.uid, (err, result) => {
            try {
                if(err) throw err

                if(result.length === 0){
                    return res.status(200).send({
                        error: true,
                        message: 'Hanya admin yang bisa menambahkan film'
                    })
                }

                db.query('INSERT INTO movies SET ?', data, (err,result) => {
                    try {
                        if(err) throw err
                        let dataToSend = {
                            id: result.insertId,
                            name: data.name,
                            genre: data.genre,
                            release_date: data.release_date,
                            release_month: data.release_month,
                            duration_mind: data.duration_min,
                            description: data.description
                        }
                        res.status(200).send({
                            error: false,
                            message: 'Add Movie Success',
                            result: dataToSend
                        })
                    } catch (error) {
                        res.status(500).send({
                            error: true,
                            message: error.message
                        })
                    }
                } )
            } catch (error) {
                res.status(500).send({
                    error: true,
                    message: error.message
                })
            }
        })
    } catch (error) {
        res.status(406).send({
            error: true,
            message: error.message
        })
    }
}

const movieStatus = (req, res) => {
    try {
        const token = req.dataToken
        const status = req.body.status
        const id = req.params.id
        if(!status) throw {message: 'status harus diisi'}

        db.query('SELECT * FROM users WHERE uid = ? AND role = 1', token.uid, (err, result) => {
            try {
                if(err) throw err

                if(result.length === 0){
                    return res.status(200).send({
                        error: true,
                        message: 'Hanya admin yang bisa merubah status film'
                    })
                }

                db.query('SELECT * FROM movies WHERE id = ?', id, (err, result) => {
                    try {
                        if(err) throw err
                        
                        if(result[0].status === status){
                            return res.status(200).send({
                                error: true,
                                message: 'Status film sama dengan status yang ingin diganti'
                            })
                        }

                        if(result.length !== 1){
                            return res.status(200).send({
                                error: true,
                                message: 'Film tidak ditemukan'
                            })
                        }
        
                        db.query('UPDATE movies SET status = ?', status, (err, result) => {
                            try {
                                if(err) throw err
                                let dataToSend = {
                                    id: req.params.id,
                                    message: 'status has been changed'
                                }
                                res.status(200).send({
                                    error: false,
                                    result: dataToSend
                                })
                            } catch (error) {
                                res.status(500).send({
                                    error: true,
                                    message: error.message
                                })
                            }
                        })
                    } catch (error) {
                        res.status(500).send({
                            error: true,
                            message: error.message
                        })
                    }
                })
            }catch(error){
                res.status(500).send({
                    error: true,
                    message: error.message
                })
            }
        })
        
    } catch (error) {
        res.status(406).send({
            error: true,
            message: error.message
        })
    }

}

const addSchedule = (req, res) => {
    try {
        const token = req.dataToken
        const data = req.body
        const id = req.params.id

        if(!data.location_id || !data.time_id) throw {message: 'Data harus diisi'}

        db.query('SELECT * FROM users WHERE uid = ? AND role = 1', token.uid, (err, result) => {
            try {
                if(err) throw err

                if(result.length === 0){
                    return res.status(200).send({
                        error: true,
                        message: 'Hanya admin yang dapat menambahkan jadwal film'
                    })
                }
                let dataToInsert = {
                    movie_id: id,
                    location_id: data.location_id,
                    time_id: data.time_id
                }
                db.query('INSERT INTO schedules SET ?', dataToInsert, (err, result) => {
                    try {
                        if(err) throw err

                        res.status(200).send({
                            error: false,
                            result: {
                                id: req.params.id,
                                message: 'Schedule has been added'
                            }
                        })
                    } catch (error) {
                        res.status(500).send({
                            error: true,
                            message: error.message
                        })
                    }
                })
            }catch(error){
                res.status(500).send({
                    error: true,
                    message: error.message
                })
            }
        })

    } catch (error) {
        res.status(406).send({
            error: true,
            message: error.message
        })
    }
}

module.exports = {
    register: register,
    login: login,
    deactive: deactivateAccount,
    activate: activateAccount,
    close: closeAccount,
    getAllMovies: getAllMovies,
    certainMovie: getCertainMovie,
    addMovie: addMovie,
    movieStatus: movieStatus,
    addSchedule: addSchedule
}

