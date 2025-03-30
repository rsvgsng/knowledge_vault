import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { BugIcon, DownloadIcon, FileIcon, PlusIcon, Trash } from 'lucide-react'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Drawer } from 'vaul'
import { toast } from 'sonner'

const VIEWABLE_EXTENSIONS = ['js', 'ts', 'jsx', 'tsx', 'json', 'txt', 'md', 'html', 'css', 'py', 'java', 'cpp', 'c', 'sh']

function RepoPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [open, setOpen] = React.useState(false)
    const [showIssueDialog, setShowIssueDialog] = React.useState(false)
    const [showCreateIssueDialog, setShowCreateIssueDialog] = React.useState(false)
    const [showDialog, setShowDialog] = React.useState(false)

    const [repoData, setRepoData] = React.useState < any > (null)
    const [selectedFile, setSelectedFile] = React.useState < any > (null)
    const [fileContent, setFileContent] = React.useState < string > ("")
    const [isPreviewable, setIsPreviewable] = React.useState(true)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchRepo = async () => {
            try {
                const token = localStorage.getItem("token")
                const res = await fetch(`http://localhost:3000/repo/get/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                const result = await res.json()

                if (!res.ok) {
                    throw new Error(result.message || "Failed to load repository")
                }

                setRepoData(result.data)
            } catch (err: any) {
                toast.error(err.message || "Error loading repository")
            } finally {
                setLoading(false)
            }
        }

        fetchRepo()
    }, [id])

    const handleFileClick = async (file: any) => {
        setSelectedFile(file)
        setOpen(true)

        const ext = file.type?.toLowerCase()
        if (ext && VIEWABLE_EXTENSIONS.includes(ext)) {
            setIsPreviewable(true)
            try {
                const token = localStorage.getItem("token")
                const res = await fetch(`http://localhost:3000/${file.path}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const text = await res.text()
                setFileContent(text)
            } catch (err) {
                setFileContent('Error loading file content.')
            }
        } else {
            setIsPreviewable(false)
            setFileContent('')
        }
    }

    return (
        <React.Fragment>
            {/* Upload File Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload a new file</DialogTitle>
                        <DialogDescription>You are about to upload a new file.</DialogDescription>
                        <div className="flex flex-col gap-3 mt-4">
                            <Label>File Name</Label>
                            <Input placeholder="Enter file name" />
                            <Label>Description</Label>
                            <Textarea placeholder="Enter file description" className='h-40' />
                            <Label>Choose file</Label>
                            <Input type="file" />
                            <Button className="mt-4">Upload</Button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* Issue Dialog */}
            <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Issues</DialogTitle>
                        <DialogDescription>Create or view issues</DialogDescription>
                        <div className="flex gap-2 mt-4">
                            <Button className="w-1/2" onClick={() => navigate(`/issues/${id}`)}>View Issues</Button>
                            <Button className="w-1/2" onClick={() => {
                                setShowIssueDialog(false)
                                setShowCreateIssueDialog(true)
                            }}>Create Issue</Button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* Create Issue Dialog */}
            <Dialog open={showCreateIssueDialog} onOpenChange={setShowCreateIssueDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create an issue</DialogTitle>
                        <DialogDescription>Describe the issue you are facing</DialogDescription>
                        <div className="flex flex-col gap-3 mt-4">
                            <Label>Title</Label>
                            <Input placeholder="Issue title" />
                            <Label>Issue Type</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="bug" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bug">Bug</SelectItem>
                                    <SelectItem value="feature">Feature</SelectItem>
                                    <SelectItem value="task">Task</SelectItem>
                                    <SelectItem value="improvement">Improvement</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <Label>Description</Label>
                            <Textarea className="h-40" placeholder="Detailed issue description" />
                            <Button className="mt-4" onClick={() => setShowCreateIssueDialog(false)}>Create Issue</Button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* File Drawer */}
            <Drawer.Root direction="right" open={open} onOpenChange={setOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/40 z-20" />
                    <Drawer.Content className="bg-white w-[90%] h-full fixed bottom-0 right-0 z-50">
                        {selectedFile && (
                            <>
                                <div className="flex items-center justify-between p-4 border-b">
                                    <div>
                                        <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
                                        <p className="text-sm text-gray-500">Last updated {new Date(selectedFile.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="destructive" className="flex items-center gap-2">
                                            <Trash className="w-4" />
                                            Delete
                                        </Button>
                                        <a href={`/${selectedFile.path}`} download>
                                            <Button variant="outline" className="flex items-center gap-2">
                                                <DownloadIcon className="w-4" />
                                                Download
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                                <div className="p-4 text-sm font-mono whitespace-pre-wrap">
                                    {isPreviewable ? (
                                        <>{fileContent}</>
                                    ) : (
                                        <p className="italic text-gray-400">This file cannot be previewed.</p>
                                    )}
                                </div>
                            </>
                        )}
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>

            {/* Repo Header */}
            <div className="flex justify-between items-center p-4">
                <div>
                    <h1 className="text-2xl font-bold">{repoData?.name || id}</h1>
                    <p className="text-sm text-gray-500">by John Doe</p>
                </div>
                <div className="flex gap-2">
                    <Button className="flex items-center gap-2">
                        <DownloadIcon className="w-4" />
                        Code
                    </Button>
                    <Button className="flex items-center gap-2" onClick={() => setShowIssueDialog(true)}>
                        <BugIcon className="w-4" />
                        Issue
                    </Button>
                </div>
            </div>

            <hr />

            {/* Files Section */}
            <div className="flex p-4 gap-4">
                <div className="w-2/3 border rounded">
                    <div className="flex justify-between items-center bg-gray-50 p-3 border-b">
                        <h4 className="text-md font-semibold text-gray-800">
                            Files <span className="text-sm text-gray-500">({repoData?.files?.length || 0})</span>
                        </h4>
                        <Button variant="outline" onClick={() => setShowDialog(true)}>
                            <PlusIcon className="w-4 mr-1" /> Add File
                        </Button>
                    </div>
                    <div className="p-2">
                        {repoData?.files?.map((file: any) => (
                            <div
                                key={file.id}
                                className="flex justify-between p-3 border-b cursor-pointer hover:bg-gray-50"
                                onClick={() => handleFileClick(file)}
                            >
                                <div className="flex items-center gap-2">
                                    <FileIcon className="w-4" />
                                    <span className="text-sm font-semibold text-blue-700 hover:underline">
                                        {file.name}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {new Date(file.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                        {!repoData?.files?.length && (
                            <div className="p-3 text-center text-sm text-gray-500">No files found.</div>
                        )}
                    </div>
                </div>

                {/* About Section */}
                <div className="w-1/3 p-2">
                    <h3 className="text-md font-semibold mb-2 text-gray-800">About</h3>
                    <p className="text-sm text-gray-600">{repoData?.description || 'No description available.'}</p>
                </div>
            </div>
        </React.Fragment>
    )
}

export default RepoPage
