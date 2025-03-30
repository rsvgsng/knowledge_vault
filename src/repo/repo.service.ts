import { Injectable, NotFoundException } from '@nestjs/common';
import { createRepoDTO } from './dto/repo.dto';
import { PrismaService } from 'prisma/prisma.service';
import { userType } from 'src/auth/dto/auth.dto';
import { ResponseDTO } from 'src/auth/dto/response.dto';
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class RepoService {
    constructor(
        private readonly prismaService: PrismaService
    ) { }
    async createRepo(repo: createRepoDTO, req: userType): Promise<ResponseDTO> {
        const user = req.user.username
        let { reponame, description, language } = repo
        if (!reponame || !description || !language) {
            return {
                code: 400,
                message: 'Please provide all required fields',
                data: null
            }
        }

        if (reponame.length < 3) {
            return {
                code: 400,
                message: 'Repo name must be at least 3 characters long',
                data: null
            }
        }

        if (description.length < 10) {
            return {
                code: 400,
                message: 'Description must be at least 10 characters long',
                data: null
            }
        }
        let checkRepo = await this.prismaService.repository.findMany({
            where: {
                name: {
                    equals: reponame
                }
            }
        })

        if (checkRepo.length > 0) {
            return {
                code: 400,
                message: 'Change repo name, this repo name already exists',
                data: null
            }
        }

        // if the repo name has spaces add - in between the spaces
        if (reponame.includes(' ')) {
            reponame = reponame.replace(/ /g, '-')
        }
        await this.prismaService.repository.create({
            data: {
                name: reponame,
                description: description,
                language: language,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                    connect: {
                        username: user
                    }
                }
            }
        })



        return {
            code: 200,
            message: 'Repo created successfully',
            data: repo
        }
    }

    async getAllRepo(req: userType): Promise<ResponseDTO> {
        try {
            const repo = await this.prismaService.repository.findMany({
                orderBy: {
                    updatedAt: 'desc'
                },
                select: {
                    name: true,
                    description: true,
                    language: true,

                    user: {
                        select: {
                            name: true,
                            username: true,

                        }
                    },
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                }
            })

            if (repo.length === 0) {
                throw new NotFoundException('No repo found')
            }

            return {
                code: 200,
                message: 'Repo found successfully',
                data: repo
            }
        } catch (error) {
            throw error
        }
    }



    async getRepo(req: userType, reponame: string): Promise<ResponseDTO> {
        try {
            if (!reponame) {
                throw new NotFoundException('Please provide repo name')
            }
            let repo = await this.prismaService.repository.findUnique({
                where: {
                    name: reponame,
                },
                select: {
                    files: {},
                    issue: true,
                    name: true,
                    description: true,
                    id: true,
                    user: {
                        select: {
                            name: true,
                        }
                    }
                }

            })

            if (!repo) {
                throw new NotFoundException('No repo found')
            }
            return {
                code: 200,
                message: 'Repo found successfully',
                data: repo
            }

        } catch (error) {
            throw error
        }
    }


    async addFile(
        req: userType,
        reponame: string,
        file: Express.Multer.File,
        filename: string,
        description: string
    ): Promise<ResponseDTO | any> {
        try {
            if (!reponame) throw new NotFoundException('Please provide repo name')
            if (!description) throw new NotFoundException('Please provide description')
            if (!filename) throw new NotFoundException('Please provide file name')
            if (!file) throw new NotFoundException('Please provide file')
            if (file.size > 50 * 1024 * 1024) throw new NotFoundException('File size is too large')

            const repo = await this.prismaService.repository.findUnique({
                where: { name: reponame }
            })

            if (!repo) throw new NotFoundException('No repo found')

            // Extract extension and clean filename
            const originalExt = path.extname(file.originalname) // e.g. ".pdf"
            const baseFilename = path.basename(filename, path.extname(filename)) // remove extension if user added it
            const uploadsDir = path.join(process.cwd(), 'uploads')
            const repoDir = path.join(uploadsDir, reponame)

            // Ensure folders exist
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir)
            }

            if (!fs.existsSync(repoDir)) {
                fs.mkdirSync(repoDir)
            }

            // Auto-rename logic
            let finalFilename = `${baseFilename}${originalExt}`
            let finalPath = path.join(repoDir, finalFilename)
            let counter = 1

            while (fs.existsSync(finalPath)) {
                finalFilename = `${baseFilename}_${counter}${originalExt}`
                finalPath = path.join(repoDir, finalFilename)
                counter++
            }

            // Save file
            fs.writeFileSync(finalPath, file.buffer)

            const fileSize = file.size / 1024 / 1024 // MB
            const fileExtension = originalExt.replace('.', '') // "pdf", "txt", etc.

            // Save metadata in DB
            await this.prismaService.files.create({
                data: {
                    Repository: {
                        connect: { name: reponame }
                    },
                    name: finalFilename,
                    size: fileSize,
                    type: fileExtension,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    path: `uploads/${reponame}/${finalFilename}`,
                    description: description
                }
            })


            await this.prismaService.repository.update({
                where: { name: reponame },
                data: {
                    updatedAt: new Date(),
                }
            })
            return {
                code: 200,
                message: 'File added successfully',
                data: `uploads/${reponame}/${finalFilename}`
            }

        } catch (error) {
            throw error
        }
    }


}
