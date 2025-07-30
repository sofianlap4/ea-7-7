import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import { fetchStudentCourses, fetchPaidVersionPreviewsCourses } from "../../api/courses";
import { fetchUserActivePackStatus } from "../../api/users";
import { useNavigate } from "react-router-dom";


const CourseList: React.FC<{ userRole: string; userId?: string }> = ({ userRole, userId }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [premiumCourses, setPremiumCourses] = useState<any[]>([]);
  const [isFreeVersion, setIsFreeVersion] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [premiumPage, setPremiumPage] = useState(0);
  const premiumPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      setLoading(true);
      if (userRole === "student" && userId) {
        // Check active pack status
        const status = await fetchUserActivePackStatus(userId);
        if (status.success && status.data) {
          setIsFreeVersion(status.data.freeVersion === true);
          if (status.data.freeVersion === true) {
            // Free version: fetch both sections
            const [freeRes, premiumRes] = await Promise.all([
              fetchStudentCourses(),
              fetchPaidVersionPreviewsCourses(),
            ]);
            if (!ignore) {
              setCourses(Array.isArray(freeRes.data) ? freeRes.data : []);
              setPremiumCourses(Array.isArray(premiumRes.data) ? premiumRes.data : []);
            }
          } else if (status.data.freeVersion === false) {
            // Paid version: only fetch normal courses
            const freeRes = await fetchStudentCourses();
            if (!ignore) {
              setCourses(Array.isArray(freeRes.data) ? freeRes.data : []);
              setPremiumCourses([]);
            }
          } else {
            // No active pack
            if (!ignore) {
              setCourses([]);
              setPremiumCourses([]);
            }
          }
        } else {
          setIsFreeVersion(null);
          setCourses([]);
          setPremiumCourses([]);
        }
      }
      setLoading(false);
    }
    fetchData();
    return () => { ignore = true; };
  }, [userRole, userId]);

  if (loading) return <div>Chargement...</div>;

  // Pagination logic for premium courses
  const pageCount = Math.ceil(premiumCourses.length / premiumPerPage);
  const paginatedPremium = premiumCourses.slice(
    premiumPage * premiumPerPage,
    (premiumPage + 1) * premiumPerPage
  );

  return (
    <div>
      <h2>Liste des cours :</h2>
      <ul>
        {courses.length > 0 ? (
          courses.map((course) => (
            <li key={course.id} style={course.isOpened ? {} : { color: "gray" }}>
              <Link to={`/courses/${course.id}`}>
                <strong>titre: {course.title}</strong>
              </Link>
              description: {course.description ? `: ${course.description}` : ""}
            </li>
          ))
        ) : (
          <li>Pas de cours trouvés.</li>
        )}
      </ul>

      {isFreeVersion && premiumCourses.length > 0 && (
        <>
          <h3>Premium (cours disponibles si vous passez à la version payante) :</h3>
          <ul>
            {paginatedPremium.map((course) => (
              <li
                key={course.id}
                style={{ background: "#eee", color: "#888", cursor: "pointer", borderRadius: 4, marginBottom: 8, padding: 8 }}
                onClick={() => navigate("/packs")}
                title="Voir les packs disponibles"
              >
                <strong>titre: {course.title}</strong>
                {course.description ? ` : ${course.description}` : ""}
              </li>
            ))}
          </ul>
          {pageCount > 1 && (
            <ReactPaginate
              previousLabel={"← Précédent"}
              nextLabel={"Suivant →"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={1}
              pageRangeDisplayed={2}
              onPageChange={({ selected }) => setPremiumPage(selected)}
              forcePage={premiumPage}
              containerClassName={"pagination-container"}
              pageClassName={"pagination-page"}
              previousClassName={"pagination-previous"}
              nextClassName={"pagination-next"}
              breakClassName={"pagination-break"}
              activeClassName={"pagination-active"}
              disabledClassName={"pagination-disabled"}
            />
          )}

          {/* Inline styles for pagination */}
          <style>{`
            .pagination-container {
              display: flex;
              list-style: none;
              gap: 8px;
              justify-content: center;
              margin: 16px 0;
              padding: 0;
            }
            .pagination-page, .pagination-previous, .pagination-next, .pagination-break {
              background: #fff;
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 6px 14px;
              cursor: pointer;
              font-size: 1rem;
              transition: background 0.2s, color 0.2s;
            }
            .pagination-page:hover, .pagination-previous:hover, .pagination-next:hover {
              background: #f0f0f0;
            }
            .pagination-active {
              background: #1976d2;
              color: #fff !important;
              border-color: #1976d2;
            }
            .pagination-disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default CourseList;