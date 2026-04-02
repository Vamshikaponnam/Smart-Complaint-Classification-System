package com.complaint.system.repository;

import com.complaint.system.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserId(Long userId);
    List<Complaint> findByEmail(String email);
    List<Complaint> findByStatus(String status);
    List<Complaint> findByCategory(String category);
}
