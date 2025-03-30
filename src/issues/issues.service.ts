import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateIssueDto } from './dto/issue.dto';
import { ResponseDTO } from 'src/auth/dto/response.dto';
import { userType } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class IssuesService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    async createIssue(createIssue: CreateIssueDto, req: userType): Promise<ResponseDTO> {
        try {
            if (!createIssue.description || !createIssue.issue_type || !createIssue.title) {
                throw new UnauthorizedException("Please fill all the fields");
            }

            await this.prisma.issue.create({
                data: {
                    title: createIssue.title,
                    description: createIssue.description,
                    issueType: createIssue.issue_type,
                    status: "OPEN",
                    user: {
                        connect: {
                            username: req.user.username
                        }
                    },
                    repository: {
                        connect: {
                            id: createIssue.repoid
                        }
                    }
                },
            })

            return {
                code: 200,
                message: "Issue created successfully",
                data: null
            }
        } catch (error) {
            throw error
        }

    }


    async getAllIssues(req: userType): Promise<ResponseDTO> {
        try {
            const issues = await this.prisma.issue.findMany({
                select: {
                    repository: {
                        select: {
                            name: true,
                            id: true,
                        }
                    },
                    user: {
                        select: {
                            username: true
                        }
                    },
                    createdAt: true,
                    issueType: true

                }
            })

            return {
                code: 200,
                message: "Issues fetched successfully",
                data: issues
            }
        } catch (error) {
            throw error
        }
    }


    async getIssuesByRepoId(req: userType, repoid: string): Promise<ResponseDTO> {
        try {
            const issues = await this.prisma.issue.findMany({
                where: {
                    repository: {
                        id: repoid
                    }
                },
                select: {
                    title: true,
                    description: true,
                    id: true,
                    issueType: true,
                    repository: {
                        select: {
                            name: true
                        }
                    },
                    status: true,
                    createdAt: true,
                    user: {
                        select: {
                            username: true
                        }
                    }
                }
            })
            let reponame = issues[0].repository.name

            return {
                code: 200,

                message: "Issues fetched successfully",
                data: {
                    issues: issues,
                    reponame: reponame
                }
            }
        } catch (error) {
            throw error
        }
    }


    async getIssueById(req: userType, issueid: string): Promise<ResponseDTO> {
        try {
            const issue = await this.prisma.issue.findUnique({
                where: {
                    id: issueid
                },
                select: {
                    title: true,
                    description: true,
                    id: true,
                    issueType: true,
                    repository: {
                        select: {
                            name: true
                        }
                    },
                    status: true,
                    createdAt: true,
                    user: {
                        select: {
                            username: true
                        }
                    },
                    comment: {
                        select: {
                            id: true,
                            description: true,
                            createdAt: true,
                            user: {
                                select: {
                                    username: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt: "desc"
                        }
                    }
                }
            })

            return {
                code: 200,
                message: "Issue fetched successfully",
                data: issue
            }
        } catch (error) {
            throw error
        }
    }


    async addComment(req: userType, issueid: string, comment: string): Promise<ResponseDTO> {
        try {

            if (!comment) {
                throw new UnauthorizedException("Please fill all the fields");
            }

            await this.prisma.comment.create({
                data: {
                    description: comment,
                    user: {
                        connect: {
                            username: req.user.username
                        }
                    },

                    issue: {
                        connect: {
                            id: issueid
                        }
                    },

                },
            })

            return {
                code: 200,
                message: "Comment added successfully",
                data: null
            }

        } catch (error) {
            throw error
        }
    }
}
