const express = require('express')

const fs = require('fs')

const { exec } = require('child_process')

const path = require('path')

const multer = require('multer')

const bodyParser = require('body-parser')

const app = express()

var dir = 'public';
var subDirectory = 'public/uploads'

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);

    fs.mkdirSync(subDirectory)

}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({storage:storage})

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(express.static('public'))

const PORT = process.env.PORT || 3002

app.get('/',(req,res) => {
    res.sendFile(__dirname +'/home.html')
})
app.post('/compress',upload.single('file'),(req,res,next) => {
    var bitrate = "350k";
    if(req.file){
        console.log(req.file.path)
        bitrate = req.body.bitrate != null ? req.body.bitrate : "350k";
        var videoOutput = Date.now() + "output.mp4"
        exec(`ffmpeg -i ${req.file.path} -b:v ${bitrate} -bufsize ${bitrate} ${videoOutput}` ,(error, stdout, stderr) => {
            if (error) {
                console.log(`Video File error: ${error.message}`);
                return;
            }
            else{
                console.log("Video File is converted")
               res.download(videoOutput,(err) => {
                if(err) throw err

                fs.unlinkSync(req.file.path)
                fs.unlinkSync(videoOutput)
                next()
            })
        }
        } )
    }
})
app.post('/convert',upload.single('file'),(req,res,next) => {
    if(req.file){
        console.log(req.file.path)
        var output = Date.now() + "output.mp3"
        exec(`ffmpeg -i ${req.file.path} ${output}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            else{
                console.log("file is converted")
            res.download(output,(err) => {
                if(err) throw err
                
                fs.unlinkSync(req.file.path)
                fs.unlinkSync(output)

                next()

            })
        }
        })
    }
})
app.post('/gif',upload.single('file'),(req,res,next) => {
    
    if(req.file){
        console.log(req.file.path)
        var output = Date.now() + "output.gif"
        exec(`ffmpeg -ss 10 -t 5 -i ${req.file.path} -vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 ${output}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            else{
                console.log("file is converted")
            res.download(output,(err) => {
                if(err) throw err
                
                fs.unlinkSync(req.file.path)
                fs.unlinkSync(output)

                next()

            })
        }
        })
    }
})
app.post('/thumbnail',upload.single('file'),(req,res,next) => {
    
    if(req.file){
        console.log(req.file.path)
        var output = Date.now() + "output.png"
        exec(`ffmpeg -i ${req.file.path} -ss 00:00:05.000 -vframes 1 ${output}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            else{
                console.log("file is converted")
            res.download(output,(err) => {
                if(err) throw err
                
                fs.unlinkSync(req.file.path)
                fs.unlinkSync(output)

                next()

            })
        }
        })
    }
})



app.listen(PORT,() => {
    console.log(`App is listening on Port ${PORT}`)
})