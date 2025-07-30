import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactPaginate from "react-paginate";
import {
  fetchexerciceSolutions,
  likeSolution,
  unlikeSolution,
  commentOnSolution,
  removeComment,
} from "../../api/solutions";
import {RESPONSE_MESSAGES} from "../../utils/responseMessages"; // Ensure this import exists

import {
  fetchProfile,
} from "../../api/profile";

const PracticalexerciceSolutionsPage: React.FC = () => {
  const { exerciceId } = useParams();
  const [solutions, setSolutions] = useState<any[]>([]);
  const [comment, setComment] = useState("");
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const ITEMS_PER_PAGE = 5;

  // Fetch current user ID
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const responseProfile = await fetchProfile();
        if(responseProfile?.success) {
          setCurrentUserId(responseProfile?.data?.id || null);
        } else {
          setCurrentUserId(null);
        }
      } catch {
        setCurrentUserId(null);
      }
    };
    loadProfile();
  }, []);

  // Fetch solutions
  const loadSolutions = async () => {
    setError(null);
    try {
      const response = await fetchexerciceSolutions(exerciceId as string);
      if(response?.success) {
        setSolutions(Array.isArray(response?.data) ? response?.data.sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0)) : []);
      } else {
        setError(response?.error || "Failed to load solutions.");
      }
    } catch (err: any) {
      setError("Failed to load solutions.");
    }
  };

  useEffect(() => {
    if (currentUserId) loadSolutions();
    // eslint-disable-next-line
  }, [exerciceId, currentUserId]);

  // Like/unlike logic
  const handleLike = async (solutionId: string, alreadyLiked: boolean, isOwner: boolean) => {
    if (isOwner) {
      setError(RESPONSE_MESSAGES.CANNOT_LIKE_OWN);
      return;
    }
    setLikeLoading(solutionId);
    setError(null);
    try {
      if (alreadyLiked) {
        const res = await unlikeSolution(solutionId);
        if (res.error) setError(res.error);
      } else {
        const res = await likeSolution(solutionId);
        if (res.error) setError(res.error);
      }
      await loadSolutions();
    } catch (err: any) {
      setError("An error occurred.");
    }
    setLikeLoading(null);
  };

  // Comment logic
  const handleComment = async (solutionId: string) => {
    if (!comment.trim()) return;
    setCommentLoading(solutionId);
    setError(null);
    try {
      const res = await commentOnSolution(solutionId, comment);
      if (res.error) setError(res.error);
      setComment("");
      setCommentingId(null);
      await loadSolutions();
    } catch (err: any) {
      setError("An error occurred.");
    }
    setCommentLoading(null);
  };

  // Update total pages when solutions change
  useEffect(() => {
    setTotalPages(Math.ceil(solutions.length / ITEMS_PER_PAGE));
  }, [solutions]);

  // Remove comment logic
  const handleRemoveComment = async (solutionId: string, commentId: string) => {
    setError(null);
    try {
      const res = await removeComment(solutionId, commentId);
      if (res.error) setError(res.error);
      await loadSolutions();
    } catch (err: any) {
      setError("An error occurred.");
    }
  };

  // Handle page change
  const handlePageChange = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };

  if (currentUserId === null) {
    return <div>Loading...</div>;
  }

  // Calculate current page items
  const indexOfLastItem = (currentPage + 1) * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = solutions.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2>Solutions des autres etudiants :</h2>
      <p>Félicitations pour votre bonne réponse à l'exercice ! Voici les solutions proposées par les autres élèves : n'hésitez pas à aimer celles que vous trouvez les plus meilleures.</p>
      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
      {currentItems.map((sol) => {
        const alreadyLiked = (sol.likesList || []).some(
          (like: any) => String(like.userId) === String(currentUserId)
        );
        const isOwner = String(sol.userId) === String(currentUserId);
        return (
          <div key={sol.id} style={{ border: "1px solid #ccc", margin: 12, padding: 12 }}>
            <pre style={{ background: "#f8f8f8", padding: 8 }}>{sol.code}</pre>
            <div>
              <strong>By:</strong> {sol.user?.firstName || "Anonymous"} {sol.user?.lastName || ""}
            </div>
            <div>
              <button
                onClick={() => handleLike(sol.id, alreadyLiked, isOwner)}
                disabled={likeLoading === sol.id || isOwner}
                title={isOwner ? "You cannot like your own solution" : ""}
              >
                {alreadyLiked ? "👎 Unlike" : "👍 Like"} {sol.likes}
              </button>
              <button
                onClick={() => setCommentingId(sol.id)}
                style={{ marginLeft: 8 }}
              >
                💬 Comment
              </button>
            </div>
            {commentingId === sol.id && (
              <div style={{ marginTop: 8 }}>
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  style={{ width: 300 }}
                  disabled={commentLoading === sol.id}
                />
                <button
                  onClick={() => handleComment(sol.id)}
                  style={{ marginLeft: 8 }}
                  disabled={commentLoading === sol.id}
                >
                  Send
                </button>
              </div>
            )}
            <div style={{ marginTop: 8 }}>
              <strong>Comments:</strong>
              <ul>
                {(sol.comments || []).map((c: any) => (
                  <li key={c.id}>
                    <b>
                      {c.user?.firstName || "Anonymous"} {c.user?.lastName || ""}
                    :</b>{" "}
                    {c.text}
                    {String(c.user?.id) === String(currentUserId) && (
                      <button
                        onClick={() => handleRemoveComment(sol.id, c.id)}
                        style={{ marginLeft: 8, color: "red" }}
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
      
      {totalPages > 1 && (
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <ReactPaginate
            previousLabel={"← Précédent"}
            nextLabel={"Suivant →"}
            pageCount={totalPages}
            onPageChange={handlePageChange}
            forcePage={currentPage}
            containerClassName={"pagination"}
            previousLinkClassName={"pagination__link"}
            nextLinkClassName={"pagination__link"}
            disabledClassName={"pagination__link--disabled"}
            activeClassName={"pagination__link--active"}
            pageClassName={"pagination__item"}
            pageLinkClassName={"pagination__link"}
            breakLabel="..."
            breakClassName={"pagination__item"}
            breakLinkClassName={"pagination__link"}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
          />
        </div>
      )}

      <style>
        {`
          .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            list-style: none;
            padding: 0;
          }
          .pagination__item {
            margin: 0 4px;
          }
          .pagination__link {
            padding: 8px 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            color: #333;
            cursor: pointer;
            text-decoration: none;
          }
          .pagination__link:hover {
            background-color: #f0f0f0;
          }
          .pagination__link--active {
            background-color: #007bff;
            color: white;
            border-color: #007bff;
          }
          .pagination__link--disabled {
            color: #ccc;
            cursor: not-allowed;
          }
        `}
      </style>
    </div>
  );
};

export default PracticalexerciceSolutionsPage;
