"use client";
import React, { useState, useEffect } from 'react';
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { useCookies } from 'react-cookie';
import { useRouter, useParams } from 'next/navigation';

export default function IssueDetailsPage() {
  const router = useRouter();
  const params = useParams(); // Use useParams to get projectId
  const projectId = params.projectId;
  const issueId = params.issueId; 
  const [cookies] = useCookies(['memberId']);
  const [issue, setIssue] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined); // 상태 업데이트를 위한 상태
  const [assigneeId, setAssigneeId] = useState<number | undefined>(undefined); // 담당자 업데이트를 위한 상태
  const [devUsers, setDevUsers] = useState<any[]>([]);
  const [recommendedAssignees, setRecommendedAssignees] = useState<any[]>([]);

  useEffect(() => {
    if (projectId && issueId) {
      fetchIssueDetails();
      fetchRecommendedAssignees();
      fetchDevUsers();
    }
  }, [projectId, issueId]);

  useEffect(() => {
    if (assigneeId) {
      handleUpdateStatus();
    }
  }, [assigneeId]);

  const fetchIssueDetails = async () => {
    try {
      const response = await fetch(`https://swe.mldljyh.tech/api/projects/${projectId}/issues/${issueId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setIssue(data);
        setStatus(data.status); // 초기 상태 설정
        setAssigneeId(data.assignee ? data.assignee.id : undefined); // 초기 담당자 설정
      } else {
        console.error('Failed to fetch issue details');
      }
    } catch (error) {
      console.error('Error fetching issue details:', error);
    }
  };

  const fetchDevUsers = async () => {
    try {
      const response = await fetch(`https://swe.mldljyh.tech/api/users`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setDevUsers(data);
      } else {
        console.error('Failed to fetch DEV users');
      }
    } catch (error) {
      console.error('Error fetching DEV users:', error);
    }
  };

  const fetchRecommendedAssignees = async () => {
    try {
      const response = await fetch(
        `https://swe.mldljyh.tech/api/projects/${projectId}/issues/${issueId}/recommendedAssignees`,
        {
          credentials: 'include',
        }
      );
      if (response.ok) {
        const data = await response.json();
        setRecommendedAssignees(data);
      } else {
        console.error('Failed to fetch recommended assignees');
      }
    } catch (error) {
      console.error('Error fetching recommended assignees:', error);
    }
  };


  const handleAddComment = async () => {
    try {
      const response = await fetch(
        `https://swe.mldljyh.tech/api/projects/${projectId}/issues/${issueId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newComment }),
          credentials: 'include',
        }
      );

      if (response.ok) {
        setNewComment('');
        fetchIssueDetails(); // 댓글 추가 후 이슈 정보 다시 가져오기
      } else {
        console.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`https://swe.mldljyh.tech/api/projects/${projectId}/issues/${issueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, assignee: assigneeId ? { id: assigneeId } : null }),
        credentials: 'include',
      });

      if (response.ok) {
        alert('Issue status updated successfully!');
        fetchIssueDetails(); // 상태 업데이트 후 이슈 정보 다시 가져오기
      } else {
        console.error('Failed to update issue status');
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
  };

  if (!issue) {
    return null;
  }

  return (
    <div>
      <main key="1" className="container mx-auto px-4 py-8 md:px-6 lg:px-8 bg-white min-h-screen">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold">{issue.title}</h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    {issue.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white">
                    {issue.priority}
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-medium text-white ${
                      issue.status === 'NEW'
                        ? 'bg-gray-500'
                        : issue.status === 'ASSIGNED'
                        ? 'bg-yellow-500'
                        : issue.status === 'RESOLVED'
                        ? 'bg-green-500'
                        : issue.status === 'CLOSED'
                        ? 'bg-red-500'
                        : 'bg-purple-500'
                    }`}
                  >
                    {issue.status}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Reported by</p>
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage alt="@shadcn" src="/placeholder-avatar.jpg" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{issue.reporter.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(issue.reportedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Assigned to</p>
                  <div className="flex items-center gap-2">
                    {issue.assignee ? (
                      <>
                        <Avatar>
                          <AvatarImage alt="@shadcn" src="/placeholder-avatar.jpg" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{issue.assignee.username}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm font-medium">Unassigned</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Fixed by</p>
                  <div className="flex items-center gap-2">
                    {issue.fixer ? (
                      <>
                        <Avatar>
                          <AvatarImage alt="@shadcn" src="/placeholder-avatar.jpg" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{issue.fixer.username}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm font-medium">Unassigned</p>
                    )}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Description</h2>
                <div className="prose prose-sm dark:prose-invert">
                  <p>{issue.description}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Comments</h2>
                <div className="space-y-4">
                  {issue.comments &&
                    issue.comments.map((comment: any) => (
                      <div key={comment.id} className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage alt="@shadcn" src="/placeholder-avatar.jpg" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{comment.user.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="grid gap-2">
                  <Label className="sr-only" htmlFor="new-comment">
                    New Comment
                  </Label>
                  <Textarea
                    className="min-h-[100px]"
                    id="new-comment"
                    placeholder="Add a new comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button onClick={handleAddComment}>Add Comment</Button>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} id="status" onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="ASSIGNED">Assigned</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="REOPENED">Reopened</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                  <div className="grid gap-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <Select 
                      value={assigneeId} 
                      id="assignee" 
                      onValueChange={(value) => setAssigneeId(Number(value))} // Convert value to number
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Use devUsers for assignee options */}
                        {devUsers.map((dev: any) => (
                          <SelectItem key={dev.id} value={dev.id}>
                            {dev.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                <Button onClick={handleUpdateStatus}>Update Status</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recommended Assignees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4">
                  {recommendedAssignees.map((assignee: any) => (
                    <div key={assignee.id} className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage alt="@shadcn" src="/placeholder-avatar.jpg" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{assignee.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {/* TODO: 역할 정보 추가 */}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAssigneeId(assignee.id);
                          setStatus("ASSIGNED");
                        }}
                      >
                        Assign
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
        <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t shrink-0 md:px-6 z-10 flex justify-end">
          <Button className="ml-auto" variant="outline" onClick={() => router.push(`/project/${projectId}`)}>
            Back to Issues
          </Button>
        </footer>

    </div>
  )
}