package com.complaint.system.repository;

import com.complaint.system.entity.ComplaintEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintEventRepository extends JpaRepository<ComplaintEvent, Long> {
    List<ComplaintEvent> findByComplaintIdOrderByTimestampAsc(Long complaintId);
}
